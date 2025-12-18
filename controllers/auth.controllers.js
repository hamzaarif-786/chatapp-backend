import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";

// ================= SIGNUP =================
export const signUp = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // 1️⃣ Validate input
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // 2️⃣ Check if username or email already exists
    const userByUserName = await User.findOne({ userName });
    if (userByUserName) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create new user
    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
    });

    // 5️⃣ Generate JWT token
    const token = await genToken(user._id);

    // 6️⃣ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "none", // use 'lax' for local dev
      secure: true,   // set true in production with HTTPS
    });

    // 7️⃣ Return user data (exclude password)
    const { password: _, ...userData } = user._doc;
    return res.status(201).json({ message: "Signup successful", user: userData });
  } catch (error) {
    console.error("SIGNUP ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // 3️⃣ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // 4️⃣ Generate token
    const token = await genToken(user._id);

    // 5️⃣ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    // 6️⃣ Return user data
    const { password: _, ...userData } = user._doc;
    return res.status(200).json({ message: "Login successful", user: userData });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGOUT =================
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("LOGOUT ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
