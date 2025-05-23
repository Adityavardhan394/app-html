const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Store OTPs in memory (in production, use a proper database)
const otpStore = new Map();

// Initialize Twilio client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Route to send OTP
app.post('/api/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || !/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number'
            });
        }
        
        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Store OTP with 5 minutes expiry
        otpStore.set(phone, {
            code: otp,
            expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
            attempts: 0
        });

        // Send SMS using Twilio
        await twilioClient.messages.create({
            body: `Your MediQuick verification code is: ${otp}. Valid for 5 minutes.`,
            to: '+' + phone,  // Add + for international format
            from: process.env.TWILIO_PHONE_NUMBER
        });

        res.json({ 
            success: true,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        console.error('SMS sending failed:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send OTP' 
        });
    }
});

// Route to verify OTP
app.post('/api/verify-otp', (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Phone and OTP are required'
            });
        }

        const storedOTP = otpStore.get(phone);

        if (!storedOTP) {
            return res.status(400).json({
                success: false,
                error: 'OTP not found or expired'
            });
        }

        // Check expiry
        if (Date.now() > storedOTP.expiry) {
            otpStore.delete(phone);
            return res.status(400).json({
                success: false,
                error: 'OTP expired'
            });
        }

        // Increment attempts
        storedOTP.attempts += 1;

        // Check max attempts (3)
        if (storedOTP.attempts > 3) {
            otpStore.delete(phone);
            return res.status(400).json({
                success: false,
                error: 'Too many attempts. Please request a new OTP'
            });
        }

        // Verify OTP
        if (storedOTP.code !== otp) {
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP'
            });
        }

        // Clear used OTP
        otpStore.delete(phone);

        // Create user session
        const user = {
            id: 'user_' + Date.now(),
            phone,
            loginMethod: 'otp',
            createdAt: new Date().toISOString()
        };

        res.json({
            success: true,
            user,
            sessionId: 'sess_' + Math.random().toString(36).substr(2, 9)
        });
    } catch (error) {
        console.error('OTP verification failed:', error);
        res.status(500).json({
            success: false,
            error: 'Verification failed'
        });
    }
});

// Google Sign-In verification
app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                error: 'Google credential is required'
            });
        }
        
        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        
        // Create user from Google data
        const user = {
            id: 'google_' + payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            loginMethod: 'google',
            createdAt: new Date().toISOString()
        };

        res.json({
            success: true,
            user,
            sessionId: 'sess_' + Math.random().toString(36).substr(2, 9)
        });
    } catch (error) {
        console.error('Google auth failed:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid Google credentials'
        });
    }
});

// Apple Sign-In verification
app.post('/api/auth/apple', async (req, res) => {
    try {
        const { authorization } = req.body;
        
        // Verify Apple token
        // Note: You need to implement proper Apple token verification
        // This is a simplified version
        const applePayload = jwt.decode(authorization.id_token);
        
        // Create or get user
        const user = {
            id: 'apple_' + applePayload.sub,
            email: applePayload.email,
            // Note: Apple only provides name on first sign-in
            name: authorization.user?.name?.firstName + ' ' + authorization.user?.name?.lastName
        };

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Apple auth failed:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid Apple credentials'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 