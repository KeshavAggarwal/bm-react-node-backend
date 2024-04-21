import express from 'express';
import { Router as downloadRoutes } from './download';

const Router = express.Router();

Router.use('/download', downloadRoutes);

export { Router };
