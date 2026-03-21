export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  console.error("=== ERROR HANDLER ===");
  console.error("Message:", err.message);
  console.error("Stack:",   err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message    = err.message;

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message    = "Resource not found";
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message    = `${field} already exists`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message    = Object.values(err.errors).map((e) => e.message).join(", ");
    console.error("Validation errors:", message);
  }

  if (err.name === "JsonWebTokenError")  { statusCode = 401; message = "Invalid token"; }
  if (err.name === "TokenExpiredError")  { statusCode = 401; message = "Token expired";  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};