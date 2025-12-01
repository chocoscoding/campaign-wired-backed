import express, { Request, Response, NextFunction } from 'express';
import { makeCall, executeCampaign } from '../controllers/campaignController';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

// POST /campaign/call
// Body: { to?: string, text?: string }
router.post('/call', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await makeCall(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /campaign/execute (with optional auth for custom SMTP)
// Body: { contacts: Contact[], channels: string[], callMessage?, smsMessage?, emailSubject?, emailHtml?, emailText?, delayBetweenContacts? }
router.post('/execute', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await executeCampaign(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
