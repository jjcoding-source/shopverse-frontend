import User                from "../models/User.js";
import { generateAccessToken, generateRefreshToken, setTokenCookie } from "../utils/generateToken.js";
import jwt                 from "jsonwebtoken";


export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const user = await User.create({ name, email, password });

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookie(res, accessToken);

  res.status(201).json({
    success: true,
    token:   accessToken,
    user: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account has been suspended");
  }

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookie(res, accessToken);

  res.json({
    success: true,
    token:   accessToken,
    user: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
};


export const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: "Logged out successfully" });
};


export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist", "name price images rating");
  res.json({ success: true, user });
};


export const updateProfile = async (req, res) => {
  const { name, email, phone, address } = req.body;

  const user = await User.findById(req.user._id);
  if (name)    user.name    = name;
  if (email)   user.email   = email;
  if (phone)   user.phone   = phone;
  if (address) user.address = address;

  await user.save();

  res.json({
    success: true,
    user: {
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      phone:   user.phone,
      address: user.address,
    },
  });
};


export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
};


export const refreshToken = async (req, res) => {
  const token = req.cookies?.token || req.body.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error("No refresh token");
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user    = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const newAccessToken = generateAccessToken(user._id);
  setTokenCookie(res, newAccessToken);

  res.json({ success: true, token: newAccessToken });
};


export const toggleWishlist = async (req, res) => {
  const user      = await User.findById(req.user._id);
  const productId = req.params.productId;

  const index = user.wishlist.indexOf(productId);
  if (index > -1) {
    user.wishlist.splice(index, 1);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  res.json({
    success:     true,
    wishlist:    user.wishlist,
    wishlisted:  index === -1,
  });
};