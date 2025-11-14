import nodemailer from 'nodemailer';

interface EmailRecipient {
  email: string;
  name?: string;
  substitutionData?: Record<string, any>;
}

interface SendEmailParams {
  to: EmailRecipient[];
  from: EmailRecipient;
  subject: string;
  html?: string;
  text?: string;
  substitutionData?: Record<string, any>;
}

class EmailService {
  private static transporter: nodemailer.Transporter;
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'bulk.smtp.mailtrap.io',
        port: Number(process.env.SMTP_PORT) || 587,
        pool: true,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        maxMessages: Infinity,
        maxConnections: 5,
      });

      await this.transporter.verify();
      console.log('Email transporter verified successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      throw error;
    }
  }

  private static applySubstitutions(
    template: string,
    data: Record<string, any>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  static async sendEmail({
    to,
    from,
    subject,
    html,
    text,
    substitutionData,
  }: SendEmailParams) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Missing SMTP_USER or SMTP_PASS in environment variables');
    }

    const fromEmail = process.env.FROM_EMAIL || from.email;
    const fromName = process.env.FROM_NAME || from.name || from.email;

    const emailPromises = to.map(async (recipient) => {
      const mergedData = {
        ...substitutionData,
        ...recipient.substitutionData,
      };

      const personalizedSubject = subject
        ? this.applySubstitutions(subject, mergedData)
        : subject;
      const personalizedHtml = html
        ? this.applySubstitutions(html, mergedData)
        : html;
      const personalizedText = text
        ? this.applySubstitutions(text, mergedData)
        : text;

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: recipient.name
          ? `"${recipient.name}" <${recipient.email}>`
          : recipient.email,
        subject: personalizedSubject,
        html: personalizedHtml,
        text: personalizedText,
      };

      try {
        const result = await this.transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipient.email}: ${result.messageId}`);
        return {
          success: true,
          recipient: recipient.email,
          messageId: result.messageId,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to send email to ${recipient.email}:`, errorMessage);
        return {
          success: false,
          recipient: recipient.email,
          error: errorMessage,
        };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Bulk email results: ${successful} sent, ${failed} failed out of ${results.length} total`);

    return {
      total_rejected_recipients: failed,
      total_accepted_recipients: successful,
      results,
    };
  }

  static async close(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
      console.log('Email transporter closed');
      this.isInitialized = false;
    }
  }
}

export default { sendEmail: EmailService.sendEmail.bind(EmailService) };
