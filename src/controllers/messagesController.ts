import { Request, Response } from 'express';
import messagesService from '../services/messagesService';
import emailService from '../services/emailService';
import { getUserSmtpConfig } from '../middleware/auth';

export async function sendMessage(req: Request, res: Response) {
  const to: string | undefined = req.body?.to || process.env.MESSAGES_TO_NUMBER;
  const from: string | undefined = req.body?.from || process.env.SMS_SENDER_ID || process.env.VONAGE_VIRTUAL_NUMBER;
  const text: string = (req.body?.text as string) || req.body?.message || 'Hello from Colla via Messages API';

  if (!to) return res.status(400).json({ error: 'Missing "to" phone number in body or MESSAGES_TO_NUMBER env' });
  if (!from) return res.status(500).json({ error: 'Missing "from" (SMS_SENDER_ID or VONAGE_VIRTUAL_NUMBER) in env or body' });

  try {
    const result = await messagesService.sendSms({ to, from, text });
    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('Error sending message', err);
    return res.status(502).json({ success: false, error: err?.message || String(err) });
  }
}

export async function sendEmail(req: Request, res: Response) {
  const to = req.body?.to; // email address
  const toName = req.body?.toName || req.body?.name;
  const subject = req.body?.subject;
  const html = req.body?.html;
  const text = req.body?.text;
  const substitutionData = req.body?.substitutionData;

  const fromEmail = req.body?.from || process.env.EMAIL_FROM_ADDRESS || 'test@birdemailbox.com';
  const fromName = req.body?.fromName || process.env.EMAIL_FROM_NAME || 'Bird Test Email';

  if (!to) {
    return res.status(400).json({ error: 'Missing "to" email address' });
  }

  if (!subject) {
    return res.status(400).json({ error: 'Missing "subject"' });
  }

  if (!html && !text) {
    return res.status(400).json({ error: 'Missing email content (html or text)' });
  }

  try {
    // Check if user has custom SMTP config
    let smtpConfig = null;
    if (req.user?.id) {
      try {
        smtpConfig = await getUserSmtpConfig(req.user.id);
      } catch (error) {
        console.warn('Failed to fetch user SMTP config:', error);
      }
    }

    const result = await emailService.sendEmail({
      to: [{ email: to, name: toName, substitutionData }],
      from: { email: fromEmail, name: fromName },
      subject,
      html,
      text,
      smtpConfig: smtpConfig || undefined,
    });

    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('Error sending email', err);
    return res.status(502).json({ success: false, error: err?.message || String(err) });
  }
}

export async function sendBulkEmail(req: Request, res: Response) {
  const recipients = req.body?.recipients; // Array of { email, name?, substitutionData? }
  const subject = req.body?.subject;
  const html = req.body?.html;
  const text = req.body?.text;
  const globalSubstitutionData = req.body?.substitutionData;

  const fromEmail = req.body?.from || process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com';
  const fromName = req.body?.fromName || process.env.EMAIL_FROM_NAME || 'Colla';

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'Missing or empty "recipients" array' });
  }

  if (!subject) {
    return res.status(400).json({ error: 'Missing "subject"' });
  }

  if (!html && !text) {
    return res.status(400).json({ error: 'Missing email content (html or text)' });
  }

  try {
    // Check if user has custom SMTP config
    let smtpConfig = null;
    if (req.user?.id) {
      try {
        smtpConfig = await getUserSmtpConfig(req.user.id);
      } catch (error) {
        console.warn('Failed to fetch user SMTP config:', error);
      }
    }

    const result = await emailService.sendEmail({
      to: recipients.map((r: any) => ({
        email: r.email,
        name: r.name,
        substitutionData: r.substitutionData,
      })),
      from: { email: fromEmail, name: fromName },
      subject,
      html,
      text,
      substitutionData: globalSubstitutionData,
      smtpConfig: smtpConfig || undefined,
    });

    return res.json({ success: true, result, recipients: recipients.length });
  } catch (err: any) {
    console.error('Error sending bulk email', err);
    return res.status(502).json({ success: false, error: err?.message || String(err) });
  }
}
