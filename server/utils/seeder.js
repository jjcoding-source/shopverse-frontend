import mongoose from "mongoose";
import dotenv   from "dotenv";
import User     from "../models/User.js";
import Category from "../models/Category.js";
import Product  from "../models/Product.js";

dotenv.config();

const categories = [
  { name: "Electronics", description: "Electronic devices and accessories" },
  { name: "Fashion",     description: "Clothing, shoes and accessories"    },
  { name: "Home",        description: "Home and living products"           },
  { name: "Beauty",      description: "Beauty and personal care"           },
  { name: "Sports",      description: "Sports and fitness equipment"       },
  { name: "Books",       description: "Books and educational material"     },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log("Existing data cleared");

    // Create admin user
    await User.create({
      name:     "Admin User",
      email:    "admin@shopverse.com",
      password: "admin123",
      role:     "admin",
    });

    // Create test user
    await User.create({
      name:     "James Kumar",
      email:    "james@shopverse.com",
      password: "test123",
      role:     "user",
    });

    console.log("Users created");

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log("Categories created");

    // Map category names to IDs
    const catMap = {};
    createdCategories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    // Create products
    const products = [
      {
        name:          "Sony WH-1000XM5 Wireless Headphones",
        description:   "Industry-leading noise cancellation with up to 30-hour battery life. Crystal clear hands-free calling with 4 beamforming microphones.",
        price:         279,
        originalPrice: 349,
        category:      catMap["Electronics"],
        brand:         "Sony",
        stock:         24,
        images:        [{ public_id: "sample_1", url: "https://placehold.co/400x400?text=Sony+Headphones" }],
        isFeatured:    true,
        newArrival:    false,
        rating:        4.9,
        reviewCount:   3241,
        colors:        ["Midnight Black", "Platinum Silver"],
        tags:          ["headphones", "wireless", "noise-cancelling"],
      },
      {
        name:        "Apple Watch Series 10 — 42mm",
        description: "The most advanced Apple Watch ever with health monitoring, fitness tracking and always-on display.",
        price:       399,
        category:    catMap["Electronics"],
        brand:       "Apple",
        stock:       8,
        images:      [{ public_id: "sample_2", url: "https://placehold.co/400x400?text=Apple+Watch" }],
        isFeatured:  false,
        newArrival:  true,
        rating:      4.8,
        reviewCount: 5102,
        colors:      ["Starlight", "Midnight", "Silver"],
        tags:        ["smartwatch", "apple", "fitness"],
      },
      {
        name:          "Urban Runner Sneakers",
        description:   "Lightweight performance sneakers designed for everyday wear and running. Breathable mesh upper with responsive cushioning.",
        price:         64,
        originalPrice: 80,
        category:      catMap["Fashion"],
        brand:         "Nike",
        stock:         120,
        images:        [{ public_id: "sample_3", url: "https://placehold.co/400x400?text=Sneakers" }],
        isFeatured:    false,
        newArrival:    true,
        rating:        4.7,
        reviewCount:   876,
        colors:        ["White", "Black", "Grey"],
        sizes:         ["US 7", "US 8", "US 9", "US 10", "US 11"],
        tags:          ["sneakers", "running", "shoes"],
      },
      {
        name:        "Ergonomic Mesh Desk Chair",
        description: "Premium ergonomic office chair with adjustable lumbar support, breathable mesh back and 4D armrests for all-day comfort.",
        price:       220,
        category:    catMap["Home"],
        brand:       "Herman",
        stock:       4,
        images:      [{ public_id: "sample_4", url: "https://placehold.co/400x400?text=Desk+Chair" }],
        isFeatured:  false,
        newArrival:  false,
        rating:      4.5,
        reviewCount: 340,
        colors:      ["Black", "Grey"],
        tags:        ["chair", "office", "ergonomic"],
      },
      {
        name:          "Smart Watch Series X Fitness Tracker",
        description:   "Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking and 7-day battery life.",
        price:         149,
        originalPrice: 229,
        category:      catMap["Electronics"],
        brand:         "Samsung",
        stock:         15,
        images:        [{ public_id: "sample_5", url: "https://placehold.co/400x400?text=Smart+Watch" }],
        isFeatured:    true,
        newArrival:    false,
        rating:        4.9,
        reviewCount:   4312,
        colors:        ["Black", "Rose Gold", "Silver"],
        tags:          ["smartwatch", "fitness", "tracker"],
      },
      {
        name:        "MacBook Air M3 15-inch Laptop",
        description: "Supercharged by the M3 chip for exceptional performance. Up to 18 hours battery life with stunning Liquid Retina display.",
        price:       1099,
        category:    catMap["Electronics"],
        brand:       "Apple",
        stock:       5,
        images:      [{ public_id: "sample_6", url: "https://placehold.co/400x400?text=MacBook+Air" }],
        isFeatured:  true,
        newArrival:  true,
        rating:      4.9,
        reviewCount: 987,
        colors:      ["Midnight", "Starlight", "Space Grey"],
        tags:        ["laptop", "apple", "macbook"],
      },
      {
        name:          "Bose QuietComfort Ultra Earbuds",
        description:   "World-class noise cancellation in a truly wireless earbud. Immersive audio with CustomTune technology.",
        price:         179,
        category:      catMap["Electronics"],
        brand:         "Bose",
        stock:         31,
        images:        [{ public_id: "sample_7", url: "https://placehold.co/400x400?text=Bose+Earbuds" }],
        isFeatured:    false,
        newArrival:    false,
        rating:        4.6,
        reviewCount:   1420,
        colors:        ["Black", "White"],
        tags:          ["earbuds", "wireless", "noise-cancelling"],
      },
      {
        name:          "Premium Cotton Oversized Hoodie",
        description:   "Ultra-soft 100% cotton oversized hoodie perfect for casual wear. Available in multiple colors.",
        price:         49,
        originalPrice: 65,
        category:      catMap["Fashion"],
        brand:         "Zara",
        stock:         88,
        images:        [{ public_id: "sample_8", url: "https://placehold.co/400x400?text=Hoodie" }],
        isFeatured:    false,
        newArrival:    true,
        rating:        4.4,
        reviewCount:   628,
        colors:        ["Black", "White", "Grey", "Navy"],
        sizes:         ["XS", "S", "M", "L", "XL", "XXL"],
        tags:          ["hoodie", "casual", "cotton"],
      },
    ];

    await Product.insertMany(products);
    console.log("Products created");

    console.log("✅ Database seeded successfully");
    console.log("─────────────────────────────────");
    console.log("Admin login:  admin@shopverse.com / admin123");
    console.log("User login:   james@shopverse.com / test123");
    console.log("─────────────────────────────────");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();