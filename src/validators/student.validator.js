const { z } = require("zod");

const createStudentSchema = z.object({
  reg_no: z.string().trim().min(1, "reg_no is required"),
  first_name: z.string().trim().min(1, "first_name is required"),
  last_name: z.string().trim().min(1, "last_name is required"),
  email: z.string().trim().email("Invalid email"),
  date_of_birth: z.coerce.date(),
  department: z.string().trim().min(1, "department is required"),
});

// reg_no is the primary key, so it can't be changed. All other fields are optional.
const updateStudentSchema = createStudentSchema
  .omit({ reg_no: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

module.exports = { createStudentSchema, updateStudentSchema };