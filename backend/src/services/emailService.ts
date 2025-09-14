import nodemailer from 'nodemailer';
import { IUser } from '@/types';

export class EmailService {
  private static transporter: nodemailer.Transporter;

  // Initialize the email transporter
  static async initialize() {
    if (process.env.NODE_ENV === 'development') {
      // Use Ethereal for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      // Use configured SMTP for production
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    // Verify transporter configuration
    try {
      await this.transporter.verify();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Email service initialization failed:', error);
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(user: IUser, verificationUrl?: string): Promise<void> {
    const emailTemplate = this.getWelcomeEmailTemplate(user, verificationUrl);
    
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to ShikshaGuru! 🎓',
      html: emailTemplate,
    });
  }

  // Send email verification
  static async sendVerificationEmail(user: IUser, verificationUrl: string): Promise<void> {
    const emailTemplate = this.getVerificationEmailTemplate(user, verificationUrl);
    
    await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - ShikshaGuru',
      html: emailTemplate,
    });
  }

  // Send password reset email
  static async sendPasswordResetEmail(user: IUser, resetUrl: string): Promise<void> {
    const emailTemplate = this.getPasswordResetEmailTemplate(user, resetUrl);
    
    await this.sendEmail({
      to: user.email,
      subject: 'Password Reset - ShikshaGuru',
      html: emailTemplate,
    });
  }

  // Send password change confirmation
  static async sendPasswordChangeConfirmation(user: IUser): Promise<void> {
    const emailTemplate = this.getPasswordChangeConfirmationTemplate(user);
    
    await this.sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully - ShikshaGuru',
      html: emailTemplate,
    });
  }

  // Generic send email method
  private static async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@shikshaguru.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Email sent:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Email templates
  private static getWelcomeEmailTemplate(user: IUser, verificationUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ShikshaGuru</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
          .footer { background: #64748b; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to ShikshaGuru! 🎓</h1>
          <p>Your Journey to Excellence Starts Here</p>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>Welcome to ShikshaGuru, the premier educational marketplace connecting passionate learners with expert teachers.</p>
          
          <h3>What you can do:</h3>
          <ul>
            <li>🔍 Find qualified teachers in your area</li>
            <li>📚 Post learning opportunities</li>
            <li>💬 Chat directly with educators</li>
            <li>⭐ Read reviews and ratings</li>
            <li>🎨 Customize your learning experience</li>
          </ul>

          ${verificationUrl ? `
            <p><strong>Please verify your email address to get started:</strong></p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p><small>If the button doesn't work, copy and paste this link: ${verificationUrl}</small></p>
          ` : ''}

          <p>If you have any questions, our support team is here to help!</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 ShikshaGuru. All rights reserved.</p>
          <p>Building bridges between learners and teachers worldwide.</p>
        </div>
      </body>
      </html>
    `;
  }

  private static getVerificationEmailTemplate(user: IUser, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f0fdf4; padding: 30px; border: 1px solid #bbf7d0; }
          .footer { background: #64748b; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .button:hover { background: #059669; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Verify Your Email ✉️</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>Thank you for joining ShikshaGuru! Please verify your email address to activate your account and start exploring our educational community.</p>
          
          <p><strong>Click the button below to verify your email:</strong></p>
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          
          <p><small>If the button doesn't work, copy and paste this link into your browser: ${verificationUrl}</small></p>
          
          <p><strong>This verification link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account with ShikshaGuru, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 ShikshaGuru. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  private static getPasswordResetEmailTemplate(user: IUser, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fffbeb; padding: 30px; border: 1px solid #fed7aa; }
          .footer { background: #64748b; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .button:hover { background: #d97706; }
          .warning { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Reset Request 🔐</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>We received a request to reset your password for your ShikshaGuru account.</p>
          
          <p><strong>Click the button below to reset your password:</strong></p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p><small>If the button doesn't work, copy and paste this link into your browser: ${resetUrl}</small></p>
          
          <div class="warning">
            <p><strong>Important Security Information:</strong></p>
            <ul>
              <li>This password reset link will expire in 10 minutes</li>
              <li>You can only use this link once</li>
              <li>If you didn't request a password reset, please ignore this email</li>
              <li>Your password remains unchanged until you complete the reset process</li>
            </ul>
          </div>
          
          <p>If you continue to have problems, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 ShikshaGuru. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  private static getPasswordChangeConfirmationTemplate(user: IUser): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f0fdf4; padding: 30px; border: 1px solid #bbf7d0; }
          .footer { background: #64748b; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .success { background: #d1fae5; border: 1px solid #34d399; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Changed Successfully ✅</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          
          <div class="success">
            <p>Your password has been successfully changed. Your account is now secured with your new password.</p>
          </div>
          
          <p><strong>What this means:</strong></p>
          <ul>
            <li>Your account security has been updated</li>
            <li>You'll need to use your new password for future logins</li>
            <li>All existing sessions on other devices remain active</li>
          </ul>
          
          <p><strong>If you didn't make this change:</strong> Please contact our support team immediately as your account may be compromised.</p>
          
          <p>Thank you for keeping your ShikshaGuru account secure!</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 ShikshaGuru. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}