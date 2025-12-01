import nodemailer from 'nodemailer';
import crypto from 'crypto';

interface EmailRecipient {
  email: string;
  name?: string;
  substitutionData?: Record<string, any>;
}

interface SMTPConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_secure?: boolean;
  smtp_from_email?: string;
  smtp_from_name?: string;
}

interface SendEmailParams {
  to: EmailRecipient[];
  from: EmailRecipient;
  subject: string;
  html?: string;
  text?: string;
  substitutionData?: Record<string, any>;
  smtpConfig?: SMTPConfig; // Optional custom SMTP configuration
}

class EmailService {
  private static defaultTransporter: nodemailer.Transporter;
  private static isInitialized = false;

  /**
   * Decrypt password using AES-256-GCM
   */
  private static async decryptPassword(encryptedBase64: string): Promise<string> {
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    
    // Derive key from encryption key string
    const keyBuffer = crypto.createHash('sha256').update(encryptionKey).digest();
    
    // Decode from base64
    const combined = Buffer.from(encryptedBase64, 'base64');
    
    // Extract IV and encrypted data
    const iv = combined.subarray(0, 12);
    const encryptedData = combined.subarray(12, -16); // Exclude auth tag
    const authTag = combined.subarray(-16);
    
    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  }

  /**
   * Create a transporter instance with custom or default SMTP config
   */
  private static async createTransporter(smtpConfig?: SMTPConfig): Promise<nodemailer.Transporter> {
    if (smtpConfig) {
      // Use custom SMTP configuration
      let smtpPassword = smtpConfig.smtp_pass;
      
      // Try to decrypt password if it looks encrypted (base64)
      try {
        if (smtpPassword && smtpPassword.length > 20) {
          smtpPassword = await this.decryptPassword(smtpPassword);
        }
      } catch (error) {
        console.warn('Failed to decrypt SMTP password, using as-is:', error);
      }
      
      const transporter = nodemailer.createTransport({
        host: smtpConfig.smtp_host,
        port: smtpConfig.smtp_port,
        secure: smtpConfig.smtp_secure || false,
        auth: {
          user: smtpConfig.smtp_user,
          pass: smtpPassword,
        },
      });
      
      // Verify the connection
      await transporter.verify();
      return transporter;
    } else {
      // Use default system SMTP configuration
      if (!this.isInitialized) {
        await this.initialize();
      }
      return this.defaultTransporter;
    }
  }

  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.defaultTransporter = nodemailer.createTransport({
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

      await this.defaultTransporter.verify();
      console.log('Default email transporter verified successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Default email transporter verification failed:', error);
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
    smtpConfig,
  }: SendEmailParams) {
    // Create transporter (custom or default)
    const transporter = await this.createTransporter(smtpConfig);

    // Determine sender information
    let fromEmail: string;
    let fromName: string;
    
    if (smtpConfig) {
      // Use custom SMTP config sender info
      fromEmail = smtpConfig.smtp_from_email || smtpConfig.smtp_user;
      fromName = smtpConfig.smtp_from_name || from.name || fromEmail;
    } else {
      // Use default system sender info
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('Missing SMTP_USER or SMTP_PASS in environment variables');
      }
      fromEmail = process.env.FROM_EMAIL || from.email;
      fromName = process.env.FROM_NAME || from.name || from.email;
    }

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
        const result = await transporter.sendMail(mailOptions);
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
    
    // Close custom transporter if it was created
    if (smtpConfig && transporter !== this.defaultTransporter) {
      transporter.close();
    }
    
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
    if (this.defaultTransporter) {
      this.defaultTransporter.close();
      console.log('Default email transporter closed');
      this.isInitialized = false;
    }
  }
  
  /**
   * Test SMTP connection
   */
  static async testConnection(smtpConfig: SMTPConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = await this.createTransporter(smtpConfig);
      await transporter.verify();
      transporter.close();
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
}

export default { 
  sendEmail: EmailService.sendEmail.bind(EmailService),
  testConnection: EmailService.testConnection.bind(EmailService),
};
