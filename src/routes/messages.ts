import express, { Request, Response, NextFunction } from 'express';
import { sendMessage, sendEmail, sendBulkEmail } from '../controllers/messagesController';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

// POST /messages/send - Send SMS
router.post('/send', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendMessage(req, res);
  } catch (err) {
    console.log(err);
    
    next(err);
  }
});

// POST /messages/email - Send single email (with optional auth for custom SMTP)
router.post('/email', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendEmail(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /messages/email/bulk - Send bulk emails (with optional auth for custom SMTP)
router.post('/email/bulk', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendBulkEmail(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
