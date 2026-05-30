const rateLimit = (limit = 60, windowMs = 60000) => {
  const requests = new Map();

  return (req, res, next) => {
    // Extract IP address from request
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    // Filter out timestamps outside the sliding window
    const timestamps = requests.get(ip).filter((t) => now - t < windowMs);
    timestamps.push(now);
    requests.set(ip, timestamps);

    if (timestamps.length > limit) {
      return res.status(429).json({
        message: 'Too many requests from this client. Please try again later.'
      });
    }

    next();
  };
};

export default rateLimit;
