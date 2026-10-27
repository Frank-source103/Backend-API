const prisma = require("../utils/prisma");
const AppError = require("../utils/AppError");

const createStudent = (data) => prisma.student.create({ data });

const getStudents = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.student.count(),
  ]);

  return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getStudentByRegNo = async (reg_no) => {
  const student = await prisma.student.findUnique({ where: { reg_no } });
  if (!student) throw new AppError("Student not found", 404);
  return student;
};

const updateStudent = async (reg_no, data) => {
  await getStudentByRegNo(reg_no); // throws 404 if missing
  return prisma.student.update({ where: { reg_no }, data });
};

const deleteStudent = async (reg_no) => {
  await getStudentByRegNo(reg_no);
  return prisma.student.delete({ where: { reg_no } });
};

module.exports = {
  createStudent,
  getStudents,
  getStudentByRegNo,
  updateStudent,
  deleteStudent,
};