import express, { Request, Response, NextFunction } from 'express';
import { inboundMessage, messageStatus } from '../controllers/webhookController';

const router = express.Router();

// POST /webhook/message/inbound
router.post('/message/inbound', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await inboundMessage(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /webhook/message/status
router.post('/message/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await messageStatus(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
