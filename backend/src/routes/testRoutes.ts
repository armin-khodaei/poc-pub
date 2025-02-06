import express from 'express';
import { getTestMessage } from '../controllers/testController';

const router = express.Router();

router.get('/test', getTestMessage);

export default router; 