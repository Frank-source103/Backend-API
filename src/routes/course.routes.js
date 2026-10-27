const express = require("express");
const resultController = require("../controllers/result.controller");
const controller = require("../controllers/course.controller");
const validate = require("../middleware/validate");
const {
  createCourseSchema,
  updateCourseSchema,
} = require("../validators/course.validator");

const router = express.Router();

router.post("/", validate(createCourseSchema), controller.createCourse);
router.get("/", controller.getCourses);
router.get("/:id", controller.getCourse);
router.put("/:id", validate(updateCourseSchema), controller.updateCourse);
router.delete("/:id", controller.deleteCourse);
router.get("/:id/results", resultController.getCourseResults);

module.exports = router;