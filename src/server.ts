import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { Router as allRoutes } from './routes/index';

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors());
// Middleware for parsing JSON requests
app.use(bodyParser.json());

app.use('/api', allRoutes);

// base get api
app.get('/', async (req, res) => {
  res.status(200).send('Welcome to the Marriage Biodata Maker!!');
});

interface ResponseError extends Error {
  status?: number;
}

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  console.log(req.url);
  var err = new Error('Not Found') as ResponseError;
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
