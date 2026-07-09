import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import redisClient from '../config/redis.js';



const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },                          
        process.env.JWT_ACCESS_SECRET,      
        { expiresIn: '15m' }                 
    );
    
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,      
        { expiresIn: '7d' }                  
    );
    
    return { accessToken, refreshToken };   
};



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

        const { accessToken, refreshToken } = generateTokens(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        await redisClient.set(`apikey:${user.apiKey}`, user._id.toString());

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json({ success: true, accessToken, apiKey: user.apiKey });
    } catch (err) {
        console.error('❌ [Login Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;  
        if (!refreshToken) {
            return res.status(401).json({ success: false, error: 'No refresh token' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ success: false, error: 'Invalid refresh token' });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ success: true, accessToken });
    } catch (err) {
        return res.status(403).json({ success: false, error: 'Invalid or expired refresh token' });
    }
};


export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.decode(refreshToken);
            if (decoded?.userId) {
                await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
            }
        }
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};