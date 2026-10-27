const express = require("express");
const resultController = require("../controllers/result.controller");
const controller = require("../controllers/student.controller");
const validate = require("../middleware/validate");
const {
  createStudentSchema,
  updateStudentSchema,
} = require("../validators/student.validator");

const router = express.Router();

router.post("/", validate(createStudentSchema), controller.createStudent);
router.get("/", controller.getStudents);
router.get("/:reg_no", controller.getStudent);
router.put("/:reg_no", validate(updateStudentSchema), controller.updateStudent);
router.delete("/:reg_no", controller.deleteStudent);
router.get("/:reg_no/results", resultController.getStudentResults);
router.get("/:reg_no/gpa", resultController.getStudentGpa);

module.exports = router;