import { Request, Response } from 'express';
import emailService from '../services/emailService';

interface SMTPTestRequest {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_secure?: boolean;
}

/**
 * Test SMTP connection
 * POST /api/smtp/test
 */
export const testSmtpConnection = async (req: Request, res: Response) => {
  try {
    const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure } = req.body as SMTPTestRequest;

    // Validate required fields
    if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass) {
      return res.status(400).json({
        error: 'Missing required fields: smtp_host, smtp_port, smtp_user, smtp_pass',
      });
    }

    // Test the connection
    const result = await emailService.testConnection({
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_pass,
      smtp_secure: smtp_secure || false,
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'SMTP connection test successful',
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Connection test failed',
      });
    }
  } catch (error) {
    console.error('SMTP test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};
