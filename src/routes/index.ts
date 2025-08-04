import express from "express";
import { Router as downloadRoutes } from "./download";
import { Router as templateRoutes } from "./template";

const Router = express.Router();

Router.use("/download", downloadRoutes);
Router.use("/template", templateRoutes);

export { Router };
