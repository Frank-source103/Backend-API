const { z } = require("zod");

const createCourseSchema = z.object({
  code: z.string().trim().min(1, "code is required").toUpperCase(),
  title: z.string().trim().min(1, "title is required"),
  credit_units: z.coerce
    .number()
    .int("credit_units must be a whole number")
    .positive("credit_units must be greater than 0"),
});

const updateCourseSchema = createCourseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

module.exports = { createCourseSchema, updateCourseSchema };