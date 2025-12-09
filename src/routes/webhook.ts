import express from "express";
import UserBioData from "../models/userBioData";

const REVENUECAT_WEBHOOK_TOKEN = process.env.REVENUECAT_WEBHOOK_TOKEN;

const Router = express.Router();

Router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization;
    const expectedAuth = `Bearer ${REVENUECAT_WEBHOOK_TOKEN}`;

    if (!authHeader || authHeader !== expectedAuth) {
      console.error("Webhook authentication failed. Received:", authHeader);
      return res.status(401).json({
        status: false,
        error: "Unauthorized"
      });
    }

    const { subscriber_attributes, product_id, app_user_id } = req.body.event;

    console.log(req.body);
    console.log(subscriber_attributes);
    console.log(product_id);
    console.log(app_user_id);

    console.log(subscriber_attributes?.bm_id?.value);

    if (!subscriber_attributes?.bm_id?.value) {
      console.error("Missing bm_id in subscriber_attributes");
      return res.status(200).json({
        status: true,
        message: "Webhook received but bm_id missing"
      });
    }

    const biodataId = subscriber_attributes.bm_id.value;

    const biodata = await UserBioData.findOne({
      _id: biodataId,
      template_id: product_id,
      user_id: app_user_id,
    });

    if (!biodata) {
      console.error("No matching biodata found");
      return res.status(200).json({
        status: true,
        message: "Webhook received but no matching biodata"
      });
    }

    // handling the case where the payment is already processed
    if (biodata.payment_status === "PAYMENT_SUCCESS") {
      console.log(`Payment already processed for biodata: ${biodataId}`);
      return res.status(200).json({
        status: true,
        message: "Already processed"
      });
    }

    // updating the payment status
    biodata.payment_status = "PAYMENT_SUCCESS";
    biodata.pgType = "REVENUECAT";
    biodata.pg_response_credt = new Date();
    biodata.pg_response = req.body;
    await biodata.save();

    console.log(`Payment updated successfully for biodata: ${biodataId}`);

    res.status(200).json({
      status: true,
      message: "Webhook processed successfully"
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

