import { Router } from 'express';
import { testSmtpConnection } from '../controllers/smtpController';

const router = Router();

/**
 * POST /api/smtp/test
 * Test SMTP connection with provided credentials
 */
router.post('/test', testSmtpConnection);

export default router;
