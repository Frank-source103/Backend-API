const AppError = require("./AppError");

const parseId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("ID must be a positive whole number", 400);
  }

  return id;
};

module.exports = parseId;