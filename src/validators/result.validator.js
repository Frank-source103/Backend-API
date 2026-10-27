const { z } = require("zod");

const createResultSchema = z.object({
  reg_no: z.string().trim().min(1, "reg_no is required"),
  course_id: z.coerce
    .number()
    .int("course_id must be a whole number")
    .positive("course_id must be greater than 0"),
  score: z.coerce
    .number()
    .min(0, "score cannot be below 0")
    .max(100, "score cannot be above 100"),
  semester: z.string().trim().min(1, "semester is required"),
});

// Only score and semester can change. To move a result to a different
// student or course, delete it and create a new one.
const updateResultSchema = createResultSchema
  .pick({ score: true, semester: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

module.exports = { createResultSchema, updateResultSchema };