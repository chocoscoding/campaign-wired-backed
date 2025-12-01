import { Request, Response } from 'express';
import vonageService from '../services/vonageService';
import messagesService from '../services/messagesService';
import emailService from '../services/emailService';
import { getUserSmtpConfig } from '../middleware/auth';

// Helper to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to apply substitution data to text
const applySubstitutions = (text: string, substitutionData?: Record<string, any>): string => {
  if (!substitutionData || !text) {
    return text;
  }

  let result = text;
  for (const [key, value] of Object.entries(substitutionData)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
  }
  
  return result;
};

export async function makeCall(req: Request, res: Response) {
  const to: string | undefined = req.body?.to ;
  const text: string = (req.body?.text as string) || 'This is a text to speech call from Vonage';
  const from: string | undefined = process.env.VONAGE_VIRTUAL_NUMBER;

  if (!to) {
    return res.status(400).json({ error: 'Missing "to" phone number in request body or VOICE_TO_NUMBER env' });
  }

  if (!from) {
    return res.status(500).json({ error: 'Server misconfigured: VONAGE_VIRTUAL_NUMBER missing' });
  }

  try {
    const result = await vonageService.createOutboundCall({ to, from, text });
    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('Error making outbound call', err);
    return res.status(502).json({ success: false, error: err?.message || String(err) });
  }
}

interface Contact {
  phone?: string;
  email?: string;
  name?: string;
  substitutionData?: Record<string, any>; // Per-recipient substitution data (e.g., {first_name: "John", order_id: "12345"})
}

interface CampaignExecuteRequest {
  contacts: Contact[];
  channels: ('call' | 'sms' | 'email')[];
  callMessage?: string;
  smsMessage?: string;
  emailSubject?: string;
  emailHtml?: string;
  emailText?: string;
  emailSubstitutionData?: Record<string, any>; // Global substitution data for all emails (max 100KB)
  delayBetweenContacts?: number; // milliseconds, default 3000
}

export async function executeCampaign(req: Request, res: Response) {
  const {
    contacts,
    channels,
    callMessage,
    smsMessage,
    emailSubject,
    emailHtml,
    emailText,
    emailSubstitutionData,
    delayBetweenContacts = 3000,
  }: CampaignExecuteRequest = req.body;

  // Validation
  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: 'Missing or empty "contacts" array' });
  }

  if (!channels || !Array.isArray(channels) || channels.length === 0) {
    return res.status(400).json({ error: 'Missing or empty "channels" array' });
  }

  const validChannels = ['call', 'sms', 'email'];
  for (const channel of channels) {
    if (!validChannels.includes(channel)) {
      return res.status(400).json({ error: `Invalid channel: ${channel}. Valid: ${validChannels.join(', ')}` });
    }
  }

  // Prepare defaults
  const vonageFrom = process.env.VONAGE_VIRTUAL_NUMBER;
  const emailFrom = {
    email: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
    name: process.env.EMAIL_FROM_NAME || 'Colla Campaign',
  };

  const results: any[] = [];

  try {
    // Check if user has custom SMTP config (if authenticated)
    let smtpConfig = null;
    if (req.user?.id) {
      try {
        smtpConfig = await getUserSmtpConfig(req.user.id);
        if (smtpConfig) {
          console.log('Using custom SMTP configuration for campaign');
        }
      } catch (error) {
        console.warn('Failed to fetch user SMTP config:', error);
      }
    }

    // Process contacts with delay
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const contactResult: any = {
        contact,
        timestamp: new Date().toISOString(),
        results: {},
      };

      // Email with substitution data support
      if (channels.includes('email')) {
        if (!contact.email) {
          contactResult.results.email = { success: false, error: 'No email provided for contact' };
        } else {
          try {
            const emailResult = await emailService.sendEmail({
              to: [{
                email: contact.email,
                name: contact.name,
                substitutionData: contact.substitutionData, // Per-recipient substitution data
              }],
              from: emailFrom,
              subject: emailSubject || 'Message from Colla Campaign',
              html: emailHtml,
              text: emailText || 'Hello from Colla Campaign',
              substitutionData: emailSubstitutionData, // Global substitution data
              smtpConfig: smtpConfig || undefined, // Use custom SMTP if available
            });
            contactResult.results.email = { success: true, result: emailResult };
          } catch (err: any) {
            contactResult.results.email = { success: false, error: err.message || String(err) };
          }
        }
      }

      // Call
      if (channels.includes('call')) {
        if (!contact.phone) {
          contactResult.results.call = { success: false, error: 'No phone provided for contact' };
        } else if (!vonageFrom) {
          contactResult.results.call = { success: false, error: 'VONAGE_VIRTUAL_NUMBER not configured' };
        } else {
          try {
            // Apply substitution data to call message
            const personalizedCallMessage = applySubstitutions(
              callMessage || 'This is a call from your Colla Campaign',
              contact.substitutionData
            );
            
            const callResult = await vonageService.createOutboundCall({
              to: contact.phone,
              from: vonageFrom,
              text: personalizedCallMessage,
            });
            contactResult.results.call = { success: true, result: callResult };
          } catch (err: any) {
            contactResult.results.call = { success: false, error: err.message || String(err) };
          }
        }
      }

      // SMS
      if (channels.includes('sms')) {
        if (!contact.phone) {
          contactResult.results.sms = { success: false, error: 'No phone provided for contact' };
        } else if (!vonageFrom) {
          contactResult.results.sms = { success: false, error: 'VONAGE_VIRTUAL_NUMBER not configured' };
        } else {
          try {
            // Apply substitution data to SMS message
            const personalizedSmsMessage = applySubstitutions(
              smsMessage || 'Hello from Colla Campaign',
              contact.substitutionData
            );
            
            const smsResult = await messagesService.sendSms({
              to: contact.phone,
              from: vonageFrom,
              text: personalizedSmsMessage,
            });
            contactResult.results.sms = { success: true, result: smsResult };
          } catch (err: any) {
            contactResult.results.sms = { success: false, error: err.message || String(err) };
          }
        }
      }

      results.push(contactResult);

      // Delay before next contact (except last one)
      if (i < contacts.length - 1) {
        await delay(delayBetweenContacts);
      }
    }

    return res.json({
      success: true,
      message: `Campaign executed for ${contacts.length} contact(s) across ${channels.length} channel(s)`,
      results,
    });
  } catch (err: any) {
    console.error('Error executing campaign', err);
    return res.status(500).json({
      success: false,
      error: err?.message || String(err),
      partialResults: results,
    });
  }
}
