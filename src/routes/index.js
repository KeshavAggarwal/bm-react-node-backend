import express from 'express';
import { Router as downloadRoutes } from './download.js';

const Router = express.Router();

Router.use('/download', downloadRoutes);

export { Router };
