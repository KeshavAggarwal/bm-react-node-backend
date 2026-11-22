import cron from "node-cron";
import mongoose from "mongoose";
import admin from "../firebaseAdmin";
import User from "../models/user";
import UserBioData from "../models/userBioData";
import NotificationLog from "../models/notificationLog";
import { getISTDate } from "../helpers";

// ─── trigger IDs ──────────────────────────────────────────────────────────────

const TRIGGER_ID = {
  NO_BIODATA_NUDGE: "NO_BIODATA_NUDGE",     // signed up 2–14h ago,  no biodata created
  NO_BIODATA_REMINDER: "NO_BIODATA_REMINDER", // signed up 24–36h ago, no biodata created
  UNPAID_PREVIEW: "UNPAID_PREVIEW",           // biodata created 1–13h ago,  payment pending
  UNPAID_REMINDER: "UNPAID_REMINDER",         // biodata created 24–36h ago, payment pending
} as const;
type TriggerID = (typeof TRIGGER_ID)[keyof typeof TRIGGER_ID];

// ─── copy ─────────────────────────────────────────────────────────────────────

const COPY: Record<TriggerID, { title: string; body: string }> = {
  NO_BIODATA_NUDGE: {
    title: "Need a marriage biodata urgently? ⏱️",
    body: "Skip the Word formatting hassle. Choose a template, add your details, and get a clean PDF in 5 mins.",
  },
  NO_BIODATA_REMINDER: {
    title: "Still struggling with Word formatting? 📄",
    body: "Create a beautiful, traditional or modern marriage biodata easily. Trusted by 1.5L+ users.",
  },
  UNPAID_PREVIEW: {
    title: "Your biodata is ready to preview 👀",
    body: "Review your details, finalize your template, and share your biodata in PDF.",
  },
  UNPAID_REMINDER: {
    title: "Your saved biodata is ready 📲",
    body: "Your biodata is formatted and ready. Download your PDF to easily share with families.",
  },
};

// ─── types ────────────────────────────────────────────────────────────────────

interface Candidate {
  firebase_uid: string;
  fcm_token_android: string | null;
  fcm_token_ios: string | null;
  biodataId: mongoose.Types.ObjectId | null; // null for NO_BIODATA_* triggers
}

interface TriggerResult {
  sent: number;
  failed: number;
  skipped: number;
}

// ─── time helpers ─────────────────────────────────────────────────────────────

// IMPORTANT: getISTDate() stores timestamps as (UTC + 5:30). hoursAgo() must
// use the same base so both sides of every MongoDB date comparison are on the
// same shifted epoch. Using Date.now() here would shift all windows by 5.5h.
function hoursAgo(h: number): Date {
  return new Date(getISTDate().getTime() - h * 60 * 60 * 1000);
}

/** True if current IST time is outside the 09:00–23:30 window. */
function isQuietHours(): boolean {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000); // UTC + 5:30
  const totalMinutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return totalMinutes < 9 * 60 || totalMinutes >= 23 * 60 + 30;
}

// FCM multicast limit — hard cap enforced by Firebase
const FCM_BATCH_SIZE = 500;

// ─── core loop ────────────────────────────────────────────────────────────────

async function processCandidates(
  candidates: Candidate[],
  triggerId: TriggerID,
): Promise<TriggerResult> {
  const result: TriggerResult = { sent: 0, failed: 0, skipped: 0 };
  if (!candidates.length) return result;

  const { title, body } = COPY[triggerId];

  // Step 1 — 4-hour cooldown: one batch query for all candidates
  const uids = candidates.map((c) => c.firebase_uid);
  const recentlyNotified = new Set(
    await NotificationLog.distinct("firebase_uid", {
      firebase_uid: { $in: uids },
      status: "SENT",
      sent_at: { $gte: hoursAgo(4) },
    }),
  );

  // Step 2 — Insert log rows first (idempotency lock).
  // Collect tokens only for candidates that pass all checks.
  const tokens: string[] = [];

  for (const candidate of candidates) {
    if (recentlyNotified.has(candidate.firebase_uid)) {
      result.skipped++;
      continue;
    }

    try {
      await NotificationLog.create({
        firebase_uid: candidate.firebase_uid,
        trigger_id: triggerId,
        biodata_id: candidate.biodataId,
        status: "SENT",
        sent_at: getISTDate(),
      });
    } catch (err: any) {
      if (err.code === 11000) {
        // E11000 duplicate key — already sent for this trigger+biodata, skip
        result.skipped++;
        continue;
      }
      console.error(
        `[CRON] log insert error uid=${candidate.firebase_uid}: ${err.message}`,
      );
      result.skipped++;
      continue;
    }

    // Mark this uid as notified so a second biodata from the same user
    // is skipped in the same loop run (recentlyNotified is only pre-loaded)
    recentlyNotified.add(candidate.firebase_uid);

    // Log inserted — collect this candidate's tokens for the batch send
    if (candidate.fcm_token_android) tokens.push(candidate.fcm_token_android);
    if (candidate.fcm_token_ios) tokens.push(candidate.fcm_token_ios);
    result.sent++;
  }

  if (!tokens.length) return result;

  // Step 3 — Send all tokens in one multicast call (chunked at 500)
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += FCM_BATCH_SIZE) {
    chunks.push(tokens.slice(i, i + FCM_BATCH_SIZE));
  }

  for (const chunk of chunks) {
    try {
      await admin.messaging().sendEachForMulticast({
        tokens: chunk,
        notification: { title, body },
        data: { trigger_id: triggerId },
      });
    } catch (err: any) {
      console.error(`[FCM] multicast error trigger=${triggerId}: ${err.message}`);
    }
  }

  return result;
}

// ─── Trigger: NO_BIODATA_NUDGE ────────────────────────────────────────────────
// Users who signed up 2–14h ago and have ZERO biodata docs.

async function triggerNoBiodataNudge(): Promise<TriggerResult> {
  const users = await User.find({
    $or: [
      { fcm_token_android: { $ne: null } },
      { fcm_token_ios: { $ne: null } },
    ],
    // Upper bound 14h: a user who signs up at 10 PM hits quiet hours at 11:30 PM.
    // The window stays open until 9 AM (11h later), well within the 14h upper bound.
    created_on: { $gte: hoursAgo(14), $lte: hoursAgo(2) },
  }).lean();

  if (!users.length) return { sent: 0, failed: 0, skipped: 0 };

  const uids = users.map((u) => u.firebase_uid);

  // Exclude users who already have any biodata
  const biodataUids = new Set(
    await UserBioData.distinct("user_id", { user_id: { $in: uids } }),
  );

  // Exclude users who already received this trigger before (regardless of recency)
  const alreadySentUids = new Set(
    await NotificationLog.distinct("firebase_uid", {
      firebase_uid: { $in: uids },
      trigger_id: TRIGGER_ID.NO_BIODATA_NUDGE,
    }),
  );

  const candidates: Candidate[] = users
    .filter(
      (u) =>
        !biodataUids.has(u.firebase_uid) &&
        !alreadySentUids.has(u.firebase_uid),
    )
    .map((u) => ({
      firebase_uid: u.firebase_uid,
      fcm_token_android: u.fcm_token_android,
      fcm_token_ios: u.fcm_token_ios,
      biodataId: null,
    }));

  return processCandidates(candidates, TRIGGER_ID.NO_BIODATA_NUDGE);
}

// ─── Trigger: NO_BIODATA_REMINDER ─────────────────────────────────────────────
// Users who signed up 24–36h ago and still have ZERO biodata docs.

async function triggerNoBiodataReminder(): Promise<TriggerResult> {
  const users = await User.find({
    $or: [
      { fcm_token_android: { $ne: null } },
      { fcm_token_ios: { $ne: null } },
    ],
    created_on: { $gte: hoursAgo(36), $lte: hoursAgo(24) },
  }).lean();

  if (!users.length) return { sent: 0, failed: 0, skipped: 0 };

  const uids = users.map((u) => u.firebase_uid);

  const biodataUids = new Set(
    await UserBioData.distinct("user_id", { user_id: { $in: uids } }),
  );

  const alreadySentUids = new Set(
    await NotificationLog.distinct("firebase_uid", {
      firebase_uid: { $in: uids },
      trigger_id: TRIGGER_ID.NO_BIODATA_REMINDER,
    }),
  );

  const candidates: Candidate[] = users
    .filter(
      (u) =>
        !biodataUids.has(u.firebase_uid) &&
        !alreadySentUids.has(u.firebase_uid),
    )
    .map((u) => ({
      firebase_uid: u.firebase_uid,
      fcm_token_android: u.fcm_token_android,
      fcm_token_ios: u.fcm_token_ios,
      biodataId: null,
    }));

  return processCandidates(candidates, TRIGGER_ID.NO_BIODATA_REMINDER);
}

// ─── Trigger: UNPAID_PREVIEW ──────────────────────────────────────────────────
// Biodatas that are unpaid, non-free, and were created 1–13h ago.
// Upper bound 13h: a biodata created at 10:30 PM hits quiet hours at 11:30 PM.
// The window stays open until 9 AM (10.5h later), well within the 13h upper bound.

async function triggerUnpaidPreview(): Promise<TriggerResult> {
  const biodatas = await UserBioData.find({
    payment_status: { $ne: "PAYMENT_SUCCESS" },
    template_id: { $ne: "eg0" },
    created_on: { $gte: hoursAgo(13), $lte: hoursAgo(1) },
  })
    .select("_id user_id")
    .lean();

  if (!biodatas.length) return { sent: 0, failed: 0, skipped: 0 };

  return buildAndProcessUnpaidCandidates(biodatas, TRIGGER_ID.UNPAID_PREVIEW);
}

// ─── Trigger: UNPAID_REMINDER ─────────────────────────────────────────────────
// Biodatas that are unpaid, non-free, and were created 24–36h ago.

async function triggerUnpaidReminder(): Promise<TriggerResult> {
  const biodatas = await UserBioData.find({
    payment_status: { $ne: "PAYMENT_SUCCESS" },
    template_id: { $ne: "eg0" },
    created_on: { $gte: hoursAgo(36), $lte: hoursAgo(24) },
  })
    .select("_id user_id")
    .lean();

  if (!biodatas.length) return { sent: 0, failed: 0, skipped: 0 };

  return buildAndProcessUnpaidCandidates(biodatas, TRIGGER_ID.UNPAID_REMINDER);
}

// Shared logic for both UNPAID triggers
async function buildAndProcessUnpaidCandidates(
  biodatas: Array<{ _id: any; user_id: string }>,
  triggerId: TriggerID,
): Promise<TriggerResult> {
  const userIds = [...new Set(biodatas.map((b) => b.user_id))];

  const users = await User.find({
    firebase_uid: { $in: userIds },
    $or: [
      { fcm_token_android: { $ne: null } },
      { fcm_token_ios: { $ne: null } },
    ],
  }).lean();

  if (!users.length) return { sent: 0, failed: 0, skipped: 0 };

  const userMap = new Map(users.map((u) => [u.firebase_uid, u]));

  // Exclude biodata IDs that already have a log entry for this trigger
  const biodataIds = biodatas.map((b) => b._id);
  const existingLogBiodataIds = new Set(
    (
      await NotificationLog.find({
        trigger_id: triggerId,
        biodata_id: { $in: biodataIds },
      })
        .select("biodata_id")
        .lean()
    ).map((l) => l.biodata_id?.toString()),
  );

  const candidates: Candidate[] = [];
  for (const biodata of biodatas) {
    if (existingLogBiodataIds.has(biodata._id.toString())) continue;
    const user = userMap.get(biodata.user_id);
    if (!user) continue;
    candidates.push({
      firebase_uid: user.firebase_uid,
      fcm_token_android: user.fcm_token_android,
      fcm_token_ios: user.fcm_token_ios,
      biodataId: biodata._id as mongoose.Types.ObjectId,
    });
  }

  return processCandidates(candidates, triggerId);
}

// ─── scheduler ────────────────────────────────────────────────────────────────

export function startNotificationCron(): void {
  cron.schedule("*/30 * * * *", async () => {
    if (isQuietHours()) {
      console.log("[CRON] quiet hours — skipping");
      return;
    }

    // console.log("[CRON] notification job fired at", new Date().toISOString());

    const triggers: Array<{ name: TriggerID; fn: () => Promise<TriggerResult> }> =
      [
        { name: TRIGGER_ID.NO_BIODATA_NUDGE, fn: triggerNoBiodataNudge },
        { name: TRIGGER_ID.NO_BIODATA_REMINDER, fn: triggerNoBiodataReminder },
        { name: TRIGGER_ID.UNPAID_PREVIEW, fn: triggerUnpaidPreview },
        { name: TRIGGER_ID.UNPAID_REMINDER, fn: triggerUnpaidReminder },
      ];

    for (const { name, fn } of triggers) {
      try {
        const result = await fn();
        console.log(
          `[CRON] ${name}: sent=${result.sent} failed=${result.failed} skipped=${result.skipped}`,
        );
      } catch (err: any) {
        console.error(`[CRON] ${name} uncaught error: ${err.message}`);
      }
    }
  });

  console.log("[CRON] notification cron scheduled (every 30 min)");
}
