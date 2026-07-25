import User from "../models/User.js";
import redisClient from "../config/redis.js";

const verifyApiKey = async (req, res, next) => {

    const apiKey = req.header("x-api-key");

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "API Key Missing"
        });
    }

    // 1. Redis
    const cached = await redisClient.get(`apikey:${apiKey}`);

    if (cached) {
        req.user = JSON.parse(cached);
        return next();
    }

    // 2. MongoDB
    const user = await User.findOne({ apiKey });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid API Key"
        });
    }

    const cacheData = {
        userId: user._id.toString()
    };

    // 3. Redis save
    await redisClient.set(
        `apikey:${apiKey}`,
        JSON.stringify(cacheData),
        {
            EX: 3600
        }
    );

    req.user = cacheData;

    next();
};

export default verifyApiKey;