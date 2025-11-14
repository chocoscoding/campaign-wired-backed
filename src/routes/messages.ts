import express, { Request, Response, NextFunction } from 'express';
import { sendMessage, sendEmail, sendBulkEmail } from '../controllers/messagesController';

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

// POST /messages/email - Send single email
router.post('/email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendEmail(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /messages/email/bulk - Send bulk emails
router.post('/email/bulk', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendBulkEmail(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
