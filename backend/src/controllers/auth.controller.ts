import { Request, Response } from 'express';
import { Twilio } from 'twilio';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

// Store OTPs in memory (in production, use Redis or similar)
const otpStore: { [key: string]: { otp: string; expires: number } } = {};

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5-minute expiry
    otpStore[phone] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    // Send OTP via Twilio
    await twilio.messages.create({
      body: `Your MediQuick OTP is: ${otp}. Valid for 5 minutes.`,
      to: `+91${phone}`,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP'
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP are required'
      });
    }

    const storedOTP = otpStore[phone];

    if (!storedOTP || storedOTP.expires < Date.now() || storedOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Clear OTP
    delete otpStore[phone];

    // Find or create user
    let user = await User.findOne({ phone });
    
    if (!user) {
      user = await User.create({ phone });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          _id: user._id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP'
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user;

    const token = jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
}; 