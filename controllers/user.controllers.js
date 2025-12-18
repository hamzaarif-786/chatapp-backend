import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Current user error: ${error}` });
  }
};

// Edit profile
export const editProfile = async (req, res) => {
  try {
    const { name } = req.body;
    let imageUrl;

    if (req.file) {
      imageUrl = await uploadOnCloudinary(req.file.path);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { name, ...(imageUrl && { image: imageUrl }) },
      { new: true } // return updated document
    ).select("-password");

    if (!updatedUser) {
      return res.status(400).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: `Profile error: ${error}` });
  }
};

// Get all other users
export const getOtherUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: `Get other users error: ${error}` });
  }
};
