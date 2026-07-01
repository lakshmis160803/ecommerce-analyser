import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  console.log("Cookies:", req.cookies);

  const token = req.cookies.accessToken;

  console.log("TOKEN:", token);

  if (!token) {
    return res.status(401).json({
      message: "Not authorized",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export default protect;