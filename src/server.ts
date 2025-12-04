import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import { Router as allRoutes } from "./routes/index";
const app = express();
const PORT = process.env.PORT;

// Connect to MongoDB (make sure you have MongnpmroDB running)
mongoose.connect(
  process.env.MONGODB_URI as string,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions
);

app.use(cors());
// Middleware for parsing JSON requests
app.use(bodyParser.json());

app.use("/api", allRoutes);

// base get api
app.get("/", async (req, res) => {
  res.status(200).send("Welcome to the space, what are you looking for here?");
});

interface ResponseError extends Error {
  status?: number;
}

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  console.log(req.url);
  var err = new Error("Not Found") as ResponseError;
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // render the error page
  res.status(err.status || 500);
  res.json({
    status: 0,
    message: err.message,
  });
});

app.listen(PORT, () =>
  console.log(`🚀 Server is listening on port ${PORT}...`)
);
