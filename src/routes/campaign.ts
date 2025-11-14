import express, { Request, Response, NextFunction } from 'express';
import { makeCall, executeCampaign } from '../controllers/campaignController';

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

// POST /campaign/execute
// Body: { contacts: Contact[], channels: string[], callMessage?, smsMessage?, emailSubject?, emailHtml?, emailText?, delayBetweenContacts? }
router.post('/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await executeCampaign(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
