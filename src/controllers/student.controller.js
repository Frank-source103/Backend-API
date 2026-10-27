const studentService = require("../services/student.service");
const asyncHandler = require("../utils/asyncHandler");

const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body);
  res.status(201).json({ success: true, data: student });
});

const getStudents = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

  const result = await studentService.getStudents({ page, limit });
  res.json({ success: true, ...result });
});

const getStudent = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentByRegNo(req.params.reg_no);
  res.json({ success: true, data: student });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.reg_no, req.body);
  res.json({ success: true, data: student });
});

const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.params.reg_no);
  res.json({ success: true, message: "Student deleted" });
});

module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
};