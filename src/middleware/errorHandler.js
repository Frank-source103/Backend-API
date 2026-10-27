const errorHandler = (err, req, res, next) => {
  // 1. Errors we threw on purpose (AppError)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // 2. Malformed JSON in the request body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body",
    });
  }

  // 3. Known Prisma database errors
  if (err.code === "P2002") {
    const fields = err.meta?.target;
    const which = Array.isArray(fields) ? fields.join(", ") : fields || "field";
    return res.status(409).json({
      success: false,
      message: `A record with this ${which} already exists`,
    });
  }

  if (err.code === "P2003") {
    return res.status(409).json({
      success: false,
      message:
        "Operation blocked: this record is linked to other records (for example, it still has results)",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  // 4. Anything else is our bug: log it, but don't leak details
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

module.exports = errorHandler;