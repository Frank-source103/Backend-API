const prisma = require("../utils/prisma");
const AppError = require("../utils/AppError");
const { getGrade, getPoint } = require("../utils/grade");
const studentService = require("./student.service");
const courseService = require("./course.service");

// Attach readable student and course info to every result we return
const resultInclude = {
  student: { select: { reg_no: true, first_name: true, last_name: true } },
  course: { select: { id: true, code: true, title: true, credit_units: true } },
};

const createResult = async (data) => {
  await studentService.getStudentByRegNo(data.reg_no); // 404 if missing
  await courseService.getCourseById(data.course_id); // 404 if missing

  const existing = await prisma.result.findUnique({
    where: {
      reg_no_course_id_semester: {
        reg_no: data.reg_no,
        course_id: data.course_id,
        semester: data.semester,
      },
    },
  });
  if (existing) {
    throw new AppError(
      "A result for this student, course and semester already exists",
      409
    );
  }

  return prisma.result.create({
    data: { ...data, grade: getGrade(data.score) },
    include: resultInclude,
  });
};

const getResults = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    prisma.result.findMany({
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: resultInclude,
    }),
    prisma.result.count(),
  ]);

  return { results, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getResultById = async (id) => {
  const result = await prisma.result.findUnique({
    where: { id },
    include: resultInclude,
  });
  if (!result) throw new AppError("Result not found", 404);
  return result;
};

const updateResult = async (id, data) => {
  await getResultById(id); // throws 404 if missing

  const updateData = { ...data };
  if (data.score !== undefined) {
    updateData.grade = getGrade(data.score); // keep grade in sync with score
  }

  return prisma.result.update({
    where: { id },
    data: updateData,
    include: resultInclude,
  });
};

const deleteResult = async (id) => {
  await getResultById(id);
  return prisma.result.delete({ where: { id } });
};

const getResultsByStudent = async (reg_no) => {
  await studentService.getStudentByRegNo(reg_no);

  return prisma.result.findMany({
    where: { reg_no },
    orderBy: { created_at: "desc" },
    include: { course: resultInclude.course },
  });
};

const getResultsByCourse = async (course_id) => {
  await courseService.getCourseById(course_id);

  return prisma.result.findMany({
    where: { course_id },
    orderBy: { score: "desc" },
    include: { student: resultInclude.student },
  });
};

const getStudentGpa = async (reg_no) => {
  await studentService.getStudentByRegNo(reg_no);

  const results = await prisma.result.findMany({
    where: { reg_no },
    include: { course: { select: { credit_units: true } } },
  });

  if (results.length === 0) {
    return { reg_no, gpa: null, total_units: 0, results_counted: 0 };
  }

  let totalPoints = 0;
  let totalUnits = 0;

  for (const r of results) {
    const units = r.course.credit_units;
    totalPoints += getPoint(r.score) * units;
    totalUnits += units;
  }

  const gpa = Math.round((totalPoints / totalUnits) * 100) / 100;

  return { reg_no, gpa, total_units: totalUnits, results_counted: results.length };
};

module.exports = {
  createResult,
  getResults,
  getResultById,
  updateResult,
  deleteResult,
  getResultsByStudent,
  getResultsByCourse,
  getStudentGpa,
};