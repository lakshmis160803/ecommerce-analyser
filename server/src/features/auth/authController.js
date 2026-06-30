import User from "../users/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

   const hashedPassword = await bcrypt.hash(
  password,
  10
);

const user = await User.create({
  name,
  email,
  password: hashedPassword,
  role:"viewer"
});

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role:user.role
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

   const accessToken = jwt.sign(
  {
    id: user._id,
    role: user.role,
  },
  process.env.JWT_ACCESS_SECRET,
  {
    expiresIn: "15m",
  }
);

  const refreshToken = jwt.sign(
  {
    id: user._id,
    role: user.role,
  },
  process.env.JWT_REFRESH_SECRET,
  {
    expiresIn: "7d",
  }
);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role:user.role
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const logoutUser = (req, res) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
export const getMe = async (req, res) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    const user = await User.findById(
      decoded.id
    ).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
    });
  }
};