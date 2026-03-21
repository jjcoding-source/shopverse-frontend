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
  const page   = Number(req.query.page)  || 1;
  const limit  = Number(req.query.limit) || 20;
  const skip   = (page - 1) * limit;
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
  const page   = Number(req.query.page)  || 1;
  const limit  = Number(req.query.limit) || 20;
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
        avgOrder:{ $avg: "$totalPrice" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 12 },
  ]);

  res.json({ success: true, monthlyRevenue });
};


export const getFullAnalytics = async (req, res) => {
  const now         = new Date();
  const startOfMonth= new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLast   = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    // Revenue
    totalRevenueData,
    thisMonthRevenue,
    lastMonthRevenue,
    monthlyRevenue,
    revenueByCategory,

    // Orders
    totalOrders,
    thisMonthOrders,
    lastMonthOrders,
    ordersByStatus,
    monthlyOrders,

    // Products
    topProducts,
    lowStockProducts,
    productsByCategory,
    totalProducts,

    // Customers
    totalCustomers,
    thisMonthCustomers,
    lastMonthCustomers,
    topCustomers,
    monthlyCustomers,
  ] = await Promise.all([
    // Revenue analytics
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, avg: { $avg: "$totalPrice" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfLast, $lte: endOfLast } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id:     { month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$items" },
      {
        $lookup: {
          from:         "products",
          localField:   "items.product",
          foreignField: "_id",
          as:           "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $lookup: {
          from:         "categories",
          localField:   "productData.category",
          foreignField: "_id",
          as:           "categoryData",
        },
      },
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id:     "$categoryData.name",
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]),

    // Orders analytics
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLast, $lte: endOfLast } }),
    Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id:    { month: { $month: "$createdAt" } },
          orders: { $sum: 1 },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),

    // Products analytics
    Product.find({ isActive: true }).sort("-sold").limit(10)
      .select("name sold price images category rating")
      .populate("category", "name"),
    Product.find({ isActive: true, stock: { $lte: 5 } }).sort("stock")
      .select("name stock images brand category")
      .populate("category", "name"),
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from:         "categories",
          localField:   "category",
          foreignField: "_id",
          as:           "categoryData",
        },
      },
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id:      "$categoryData.name",
          count:    { $sum: 1 },
          revenue:  { $sum: { $multiply: ["$price", "$sold"] } },
        },
      },
      { $sort: { count: -1 } },
    ]),
    Product.countDocuments({ isActive: true }),

    // Customer analytics
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ role: "user", createdAt: { $gte: startOfLast, $lte: endOfLast } }),
    Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id:        "$user",
          totalSpent: { $sum: "$totalPrice" },
          orders:     { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from:         "users",
          localField:   "_id",
          foreignField: "_id",
          as:           "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          name:       "$userInfo.name",
          email:      "$userInfo.email",
          totalSpent: 1,
          orders:     1,
        },
      },
    ]),
    User.aggregate([
      { $match: { role: "user", createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id:   { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),
  ]);

  const totalRev   = totalRevenueData[0]?.total   || 0;
  const avgOrder   = totalRevenueData[0]?.avg      || 0;
  const thisMonRev = thisMonthRevenue[0]?.total    || 0;
  const lastMonRev = lastMonthRevenue[0]?.total    || 0;
  const revGrowth  = lastMonRev > 0
    ? (((thisMonRev - lastMonRev) / lastMonRev) * 100).toFixed(1)
    : 0;

  const thisMonOrd = thisMonthOrders  || 0;
  const lastMonOrd = lastMonthOrders  || 0;
  const ordGrowth  = lastMonOrd > 0
    ? (((thisMonOrd - lastMonOrd) / lastMonOrd) * 100).toFixed(1)
    : 0;

  const thisMonCust = thisMonthCustomers || 0;
  const lastMonCust = lastMonthCustomers || 0;
  const custGrowth  = lastMonCust > 0
    ? (((thisMonCust - lastMonCust) / lastMonCust) * 100).toFixed(1)
    : 0;

  const cancelledOrders = ordersByStatus.find((s) => s._id === "cancelled")?.count || 0;
  const cancelRate = totalOrders > 0
    ? ((cancelledOrders / totalOrders) * 100).toFixed(1)
    : 0;

  res.json({
    success: true,
    revenue: {
      total:      totalRev,
      thisMonth:  thisMonRev,
      lastMonth:  lastMonRev,
      growth:     revGrowth,
      avgOrder,
      monthly:    monthlyRevenue,
      byCategory: revenueByCategory,
    },
    orders: {
      total:      totalOrders,
      thisMonth:  thisMonOrd,
      lastMonth:  lastMonOrd,
      growth:     ordGrowth,
      cancelRate,
      byStatus:   ordersByStatus,
      monthly:    monthlyOrders,
    },
    products: {
      total:        totalProducts,
      topSelling:   topProducts,
      lowStock:     lowStockProducts,
      byCategory:   productsByCategory,
    },
    customers: {
      total:     totalCustomers,
      thisMonth: thisMonCust,
      lastMonth: lastMonCust,
      growth:    custGrowth,
      top:       topCustomers,
      monthly:   monthlyCustomers,
    },
  });
};