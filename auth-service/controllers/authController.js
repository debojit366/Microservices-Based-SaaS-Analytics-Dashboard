import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import redisClient from '../config/redis.js';

export const signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const apiKey = 'sk_' + crypto.randomBytes(24).toString('hex');

        const user = new User({ email, password: hashedPassword, apiKey });
        await user.save();

        await redisClient.set(`apikey:${apiKey}`, user._id.toString());

        res.status(201).json({ success: true, message: 'Signup successful', apiKey });
    } catch (err) {
        console.error('❌ [Signup Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        await redisClient.set(`apikey:${user.apiKey}`, user._id.toString());

        res.json({ success: true, token, apiKey: user.apiKey });
    } catch (err) {
        console.error('❌ [Login Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};