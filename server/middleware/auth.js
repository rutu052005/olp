import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'development-secret';

export function requireAuth(roles = []) {
  return (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    try {
      const user = jwt.verify(token, jwtSecret);
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (user && user.id !== undefined) {
        user.id = Number(user.id);
      }
      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}
