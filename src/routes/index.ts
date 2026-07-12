import express from "express";
import { Router as downloadRoutes } from "./download";
import { Router as templateRoutes } from "./template";
import { Router as biodataRoutes } from "./biodata";
import { Router as webhookRoutes } from "./webhook";
import { Router as authRoutes } from "./auth";
import { Router as resumeRoutes } from "./resume";

const Router = express.Router();

Router.use("/download", downloadRoutes);
Router.use("/template", templateRoutes);
Router.use("/biodata", biodataRoutes);
Router.use("/rc/webhook", webhookRoutes);
Router.use("/auth", authRoutes);
Router.use("/resume", resumeRoutes);

export { Router };
