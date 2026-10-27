const resultService = require("../services/result.service");
const asyncHandler = require("../utils/asyncHandler");
const parseId = require("../utils/parseId");

const createResult = asyncHandler(async (req, res) => {
  const result = await resultService.createResult(req.body);
  res.status(201).json({ success: true, data: result });
});

const getResults = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

  const data = await resultService.getResults({ page, limit });
  res.json({ success: true, ...data });
});

const getResult = asyncHandler(async (req, res) => {
  const result = await resultService.getResultById(parseId(req.params.id));
  res.json({ success: true, data: result });
});

const updateResult = asyncHandler(async (req, res) => {
  const result = await resultService.updateResult(
    parseId(req.params.id),
    req.body
  );
  res.json({ success: true, data: result });
});

const deleteResult = asyncHandler(async (req, res) => {
  await resultService.deleteResult(parseId(req.params.id));
  res.json({ success: true, message: "Result deleted" });
});

const getStudentResults = asyncHandler(async (req, res) => {
  const results = await resultService.getResultsByStudent(req.params.reg_no);
  res.json({ success: true, data: results });
});

const getCourseResults = asyncHandler(async (req, res) => {
  const results = await resultService.getResultsByCourse(parseId(req.params.id));
  res.json({ success: true, data: results });
});

const getStudentGpa = asyncHandler(async (req, res) => {
  const gpa = await resultService.getStudentGpa(req.params.reg_no);
  res.json({ success: true, data: gpa });
});

module.exports = {
  createResult,
  getResults,
  getResult,
  updateResult,
  deleteResult,
  getStudentResults,
  getCourseResults,
  getStudentGpa,
};