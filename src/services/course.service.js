const prisma = require("../utils/prisma");
const AppError = require("../utils/AppError");

const createCourse = (data) => prisma.course.create({ data });

const getCourses = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.course.count(),
  ]);

  return { courses, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getCourseById = async (id) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw new AppError("Course not found", 404);
  return course;
};

const updateCourse = async (id, data) => {
  await getCourseById(id); // throws 404 if missing
  return prisma.course.update({ where: { id }, data });
};

const deleteCourse = async (id) => {
  await getCourseById(id);
  return prisma.course.delete({ where: { id } });
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};