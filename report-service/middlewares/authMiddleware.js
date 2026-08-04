import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  try {
   
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token missing ya invalid format me hai",
      });
    }

    
    const token = authHeader.split(" ")[1];

    
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "your_secret_key");

    
    req.user = decoded; 

    next(); 
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid ya expired access token",
    });
  }
};