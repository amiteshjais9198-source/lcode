const redisClient = require("../config/redis"); //

const WINDOW_SIZE_IN_SECONDS = 3600; // 1 hour
const MAX_WINDOW_REQUESTS = 60;      // Max 60 per hour
const COOLDOWN_SECONDS = 10;         // LeetCode-style 10s cooldown

const rateLimiter = async (req, res, next) => {
    const ip = req.ip;
    const logKey = `ip_log:${ip}`;      // For the sliding window (60/hr)
    const cooldownKey = `lock:${req.originalUrl}:${req.ip}`;  // For the 10s cooldown

    try {
        const currentTime = Date.now() / 1000; //

        // --- FEATURE 1: 10-SECOND COOLDOWN (LEETCODE STYLE) ---
        // We use 'NX' (Set if Not Exists) to create a lock
        const isLocked = await redisClient.set(cooldownKey, "locked", {
            EX: COOLDOWN_SECONDS,
            NX: true
        });

        if (!isLocked) {
            return res.status(429).json({
                error: `Please wait ${COOLDOWN_SECONDS} seconds between submissions.`
            });
        }

        // --- FEATURE 2: SLIDING WINDOW (60 REQ / HOUR) ---
        const windowStart = currentTime - WINDOW_SIZE_IN_SECONDS; //

        // Remove old requests outside the 1-hour window
        await redisClient.zRemRangeByScore(logKey, 0, windowStart);

        // Count requests in the current window
        const requestCount = await redisClient.zCard(logKey);

        if (requestCount >= MAX_WINDOW_REQUESTS) {
            return res.status(429).json({
                error: "Hourly limit exceeded. Try again later."
            });
        }

        // Add the current request to the log
        // Value includes a random element to ensure uniqueness in the Sorted Set
        await redisClient.zAdd(logKey, [{
            score: currentTime,
            value: `${currentTime}:${Math.random()}`
        }]);

        // Keep the log key alive
        await redisClient.expire(logKey, WINDOW_SIZE_IN_SECONDS);
        next(); //

    } catch (err) {
        console.error("Rate Limiter Error:", err);
        res.status(500).json({ error: "Internal Server Error" }); //
    }
};

module.exports = rateLimiter; //