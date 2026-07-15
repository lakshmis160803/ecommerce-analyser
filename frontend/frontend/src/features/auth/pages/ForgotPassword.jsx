import bcrypt from "bcryptjs";
import User from "../users/user.Model.js"; // adjust path to your User model

export const changePasswordDirect = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("changePasswordDirect error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};