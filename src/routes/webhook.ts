import express from "express";

// RevenueCat configuration
const REVENUECAT_WEBHOOK_TOKEN = process.env.REVENUECAT_WEBHOOK_TOKEN;

const Router = express.Router();

// POST /webhook - RevenueCat webhook endpoint
Router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    // Validate Authorization header
    const authHeader = req.headers.authorization;
    const expectedAuth = `Bearer ${REVENUECAT_WEBHOOK_TOKEN}`;

    if (!authHeader || authHeader !== expectedAuth) {
      console.error("Webhook authentication failed. Received:", authHeader);
      return res.status(401).json({
        status: false,
        error: "Unauthorized"
      });
    }

    // Log the entire webhook request
    console.log("=== RevenueCat Webhook Received ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("=====================================");

    // Respond with success
    res.status(200).json({
      status: true,
      message: "Webhook received successfully"
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
});

export { Router };

