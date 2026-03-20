import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "Product",
    required: true,
  },
  name:     { type: String, required: true },
  image:    { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedColor: String,
  selectedSize:  String,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type:   String,
      unique: true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    items:          [orderItemSchema],
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName:  { type: String, required: true },
      email:     { type: String, required: true },
      phone:     String,
      address:   { type: String, required: true },
      city:      { type: String, required: true },
      state:     String,
      zip:       { type: String, required: true },
      country:   { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "stripe"],
      required: true,
    },
    paymentResult: {
      id:     String,
      status: String,
      email:  String,
    },
    subtotal:      { type: Number, required: true },
    shippingPrice: { type: Number, default: 0     },
    taxPrice:      { type: Number, default: 0     },
    discount:      { type: Number, default: 0     },
    totalPrice:    { type: Number, required: true },
    status: {
      type:    String,
      enum:    ["processing", "packed", "shipped", "transit", "delivered", "cancelled"],
      default: "processing",
    },
    isPaid:       { type: Boolean, default: false },
    paidAt:       Date,
    isDelivered:  { type: Boolean, default: false },
    deliveredAt:  Date,
    trackingNumber: String,
    notes:          String,
    stripeSessionId: String,
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count      = await mongoose.model("Order").countDocuments();
    this.orderNumber = `SV-${Date.now().toString().slice(-6)}${count + 1}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;