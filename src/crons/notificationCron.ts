import cron from "node-cron";
import admin from "../firebaseAdmin";
import User from "../models/user";
import UserBioData from "../models/userBioData";

// ─── helpers ────────────────────────────────────────────────────────────────

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

/**
 * Send a single FCM notification.
 * Returns true on success, false on any failure.
 * If the token is no longer registered, nulls it out on the users document.
 */
async function sendNotification(
  firebaseUid: string,
  fcmToken: string,
  title: string,
  body: string,
): Promise<boolean> {
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
    });
    console.log(`[FCM] ✓ sent to uid=${firebaseUid}`);
    return true;
  } catch (err: any) {
    const code: string = err?.errorInfo?.code ?? err?.code ?? "";
    console.error(`[FCM] ✗ uid=${firebaseUid} code=${code} msg=${err.message}`);

    if (code === "messaging/registration-token-not-registered") {
      await User.findOneAndUpdate(
        { firebase_uid: firebaseUid },
        { $set: { fcm_token: null, updated_on: new Date() } },
      );
      console.log(`[FCM] cleared stale token for uid=${firebaseUid}`);
    }

    return false;
  }
}

// ─── Trigger 2 — signed up but never created a biodata ──────────────────────
// Runs against users created between 4 and 5 hours ago with no userbiodata doc.

async function triggerSignedUpNoBiodata(): Promise<void> {
  console.log("[CRON] trigger2: signed-up-no-biodata start");

  const users = await User.find({
    fcm_token: { $ne: null },
    created_on: { $gte: hoursAgo(5), $lte: hoursAgo(4) },
  }).lean();

  if (!users.length) {
    console.log("[CRON] trigger2: no candidates");
    return;
  }

  // Batch-check which of these uids already have any userbiodata document
  const uids = users.map((u) => u.firebase_uid);
  const existingUids = await UserBioData.distinct("user_id", {
    user_id: { $in: uids },
  });
  const existingSet = new Set(existingUids);

  const candidates = users.filter((u) => !existingSet.has(u.firebase_uid));
  console.log(
    `[CRON] trigger2: ${candidates.length} candidate(s) after biodata filter`,
  );

  for (const user of candidates) {
    await sendNotification(
      user.firebase_uid,
      user.fcm_token!,
      "Complete your biodata",
      "Ready to create your biodata? Pick a template and you're halfway done 🎉",
    );
  }

  console.log("[CRON] trigger2: done");
}

// ─── Trigger 3 — started biodata but never completed ────────────────────────
// Runs against userbiodata docs created 6–7 hours ago, unpaid, non-free template.

async function triggerStartedButIncomplete(): Promise<void> {
  console.log("[CRON] trigger3: started-but-incomplete start");

  const staleBiodatas = await UserBioData.find({
    created_on: { $gte: hoursAgo(7), $lte: hoursAgo(6) },
    payment_status: { $ne: "PAYMENT_SUCCESS" },
    template_id: { $ne: "eg0" },
  })
    .select("user_id")
    .lean();

  if (!staleBiodatas.length) {
    console.log("[CRON] trigger3: no candidates");
    return;
  }

  // Deduplicate — one user may have multiple incomplete biodatas
  const uniqueUids = [...new Set(staleBiodatas.map((b) => b.user_id))];

  const users = await User.find({
    firebase_uid: { $in: uniqueUids },
    fcm_token: { $ne: null },
  }).lean();

  console.log(`[CRON] trigger3: ${users.length} candidate(s) with fcm_token`);

  for (const user of users) {
    await sendNotification(
      user.firebase_uid,
      user.fcm_token!,
      "Your biodata is almost ready",
      "You're so close! Finish your biodata now 📄",
    );
  }

  console.log("[CRON] trigger3: done");
}

// ─── scheduler ───────────────────────────────────────────────────────────────

export function startNotificationCron(): void {
  // Runs every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log("[CRON] notification job fired at", new Date().toISOString());
    try {
      await triggerSignedUpNoBiodata();
    } catch (err: any) {
      console.error("[CRON] trigger2 uncaught error:", err.message);
    }
    try {
      await triggerStartedButIncomplete();
    } catch (err: any) {
      console.error("[CRON] trigger3 uncaught error:", err.message);
    }
  });

  console.log("[CRON] notification cron scheduled (every 30 min)");
}
