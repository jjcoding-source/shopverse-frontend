import mongoose  from "mongoose";
import bcrypt    from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type:     String,
      required: [true, "Email is required"],
      unique:   true,
      lowercase: true,
      match:    [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:    false,
    },
    role: {
      type:    String,
      enum:    ["user", "admin"],
      default: "user",
    },
    avatar: {
      public_id: String,
      url:       String,
    },
    phone:   String,
    address: {
      street:  String,
      city:    String,
      state:   String,
      zip:     String,
      country: String,
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
    resetPasswordToken:   String,
    resetPasswordExpires: Date,
    refreshToken:         String,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;