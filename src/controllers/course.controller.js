const courseService = require("../services/course.service");
const asyncHandler = require("../utils/asyncHandler");
const parseId = require("../utils/parseId");

const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body);
  res.status(201).json({ success: true, data: course });
});

const getCourses = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

  const result = await courseService.getCourses({ page, limit });
  res.json({ success: true, ...result });
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(parseId(req.params.id));
  res.json({ success: true, data: course });
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(
    parseId(req.params.id),
    req.body
  );
  res.json({ success: true, data: course });
});

const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(parseId(req.params.id));
  res.json({ success: true, message: "Course deleted" });
});

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
};