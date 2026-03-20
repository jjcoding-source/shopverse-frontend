import User    from "../models/User.js";
import Product from "../models/Product.js";
import Order   from "../models/Order.js";
import Review  from "../models/Review.js";


export const getDashboardStats = async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueData,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.find()
      .sort("-createdAt")
      .limit(5)
      .populate("user", "name email"),
    Product.find({ isActive: true })
      .sort("-sold")
      .limit(5)
      .select("name price sold rating images"),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueData[0]?.total || 0,
    },
    recentOrders,
    topProducts,
  });
};


export const getAllUsers = async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  const search = req.query.search
    ? {
        $or: [
          { name:  { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(search).sort("-createdAt").skip(skip).limit(limit),
    User.countDocuments(search),
  ]);

  res.json({
    success: true,
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
};


export const updateUser = async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (role     !== undefined) user.role     = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();
  res.json({ success: true, user });
};


export const getAllOrders = async (req, res) => {
  const page   = Number(req.query.page)   || 1;
  const limit  = Number(req.query.limit)  || 20;
  const skip   = (page - 1) * limit;
  const filter = req.query.status ? { status: req.query.status } : {};

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("user", "name email"),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
};


export const getRevenueAnalytics = async (req, res) => {
  const monthlyRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: {
          year:  { $year:  "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$totalPrice" },
        orders:  { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 12 },
  ]);

  res.json({ success: true, monthlyRevenue });
};