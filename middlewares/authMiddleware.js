// // middlewares/authMiddleware.js

// const JWT = require("jsonwebtoken");

// module.exports = async (req, res, next) => {
//   try {
//     console.log('>>> [authMiddleware] incoming:', req.method, req.path);
//     const header = req.headers.authorization;
//     if (!header) {
//       console.log('>>> [authMiddleware] no Authorization header');
//       return res.status(401).json({ message: "No token provided", success: false });
//     }
//     const token = header.split(" ")[1];
//     console.log('>>> [authMiddleware] token:', token);

//     JWT.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         console.log('>>> [authMiddleware] verify error:', err.message);
//         return res.status(401).json({ message: "Auth Failed", success: false });
//       }
//       console.log('>>> [authMiddleware] decoded payload:', decoded);
//       // Attach userId both ways
//       req.user = decoded;
//       req.userId = decoded.id;
//       req.body.userId = decoded.id;
//       next();
//     });
//   } catch (error) {
//     console.error("Auth middleware error:", error);
//     return res.status(401).json({ message: "Auth Failed", success: false });
//   }
// };

// middlewares/authMiddleware.js

const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    console.log('>>> [authMiddleware] incoming:', req.method, req.path);

    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      console.log('>>> [authMiddleware] no or malformed Authorization header');
      return res.status(401).json({ message: "No token provided", success: false });
    }

    const token = header.split(" ")[1];
    console.log('>>> [authMiddleware] token:', token);

    // Synchronous verify so we can catch exceptions
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    console.log('>>> [authMiddleware] decoded payload:', decoded);

    // Attach to request
    req.user = decoded;           // e.g. { id: "...", iat: ..., exp: ... }
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Auth Failed", success: false });
  }
};

