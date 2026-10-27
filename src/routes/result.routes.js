const express = require("express");
const controller = require("../controllers/result.controller");
const validate = require("../middleware/validate");
const {
  createResultSchema,
  updateResultSchema,
} = require("../validators/result.validator");

const router = express.Router();

router.post("/", validate(createResultSchema), controller.createResult);
router.get("/", controller.getResults);
router.get("/:id", controller.getResult);
router.put("/:id", validate(updateResultSchema), controller.updateResult);
router.delete("/:id", controller.deleteResult);

module.exports = router;