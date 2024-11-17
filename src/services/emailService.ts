
// src/services/emailService.ts
import nodemailer from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();


export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', 
    service: process.env.SMTP_SERVICE,// true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    logger: true, // Enable logging for debugging
    debug: true,  // Enable debug output
  });
};


export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: '"3legant Team" <noreply@3legant.com>',
    to: email,
    subject: 'Password Reset Request',
    text: `Hello,\n\nYou requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nBest,\n3legant Team`,
    html: `<p>Hello,</p><p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p><p>Best,<br>3legant Team</p>`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOTPEmail = async (name: string, email: string, otp: string) => {
  const transporter = createTransporter();
  const verificationLink = `http://localhost:3000/otp?email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: '"3legant Team" <noreply@3legant.com>',
    to: email,
    subject: 'Verify Your Email - OTP',
    text: `Hello ${name},\n\nYour OTP for email verification is: ${otp}\nPlease use this code within 15 minutes.\n\nBest,\n3legant Team\n\nClick the link below to verify your email:\n${verificationLink}`,
    html: `
      <p>Hello ${name},</p>
      <p>Your OTP for email verification is: <strong>${otp}</strong></p>
      <p>Please use this code within 15 minutes.</p>
      <p><a href="${verificationLink}" style="color: #4F46E5; text-decoration: none;">Click here to verify your email</a></p>
      <p>Best,<br>3legant Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};



// Function to send Welcome email

export const sendWelcomeEmail = async (name: string, email: string) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: '"3legant Team" <noreply@3legant.com>',
    to: email,
    subject: 'Welcome to 3legant!',
    text: `Hi ${name},\n\nWelcome to 3legant! Your email has been verified successfully.\n\nBest Regards,\nThe 3legant Team`,
    html: `<p>Hi ${name},</p><p>Welcome to <strong>3legant</strong>! Your email has been verified successfully.</p><p>Best Regards,<br>The 3legant Team</p>`,
  };

  await transporter.sendMail(mailOptions);
};

// Function to resend OTP
export const resendOTPEmail = async (name: string, email: string, otp: string) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: '"3legant Team" <noreply@3legant.com>',
    to: email,
    subject: 'Resend OTP - 3legant',
    text: `Hello ${name},\n\nYour new OTP for email verification is: ${otp}\nPlease use this code within 15 minutes.\n\nBest,\n3legant Team`,
    html: `<p>Hello ${name},</p><p>Your new OTP for email verification is: <strong>${otp}</strong></p><p>Please use this code within 15 minutes.</p><p>Best,<br>3legant Team</p>`,
  };

  await transporter.sendMail(mailOptions);
};
