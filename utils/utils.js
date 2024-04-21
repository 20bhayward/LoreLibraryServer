import jwt from 'jsonwebtoken';

const JWT_SECRET = 'lore-master-reads-no-lore'; 

export const generateToken = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  return token;
};