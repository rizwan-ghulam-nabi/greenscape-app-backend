// app-backend/utils/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailUser = process.env.EMAIL_USER || '';
const emailPassword = process.env.EMAIL_APP_PASSWORD || '';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPassword
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    if (!emailUser || !emailPassword) {
      throw new Error('Missing email credentials');
    }
    
    const mailOptions = {
      from: `GreenScape <${emailUser}>`,
      to,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Email error:', err.message);
    return { success: false, error: err.message };
  }
};