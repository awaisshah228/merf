const router = require("express").Router();
const validateRequest = require("../middlewares/validate-request");
const { body, param, query } = require("express-validator");

const getDistributionDateStockMerf = require("../controllers/getDistributionDateStockMerf");
const getHospitalDateStock = require("../controllers/getHospitalDateStock");
const merfmlmisbincardreport = require("../controllers/merfmlmisbincardreport");
const addMerfConsumption = require("../controllers/addMerfConsumption");
const addMerfHossGRN = require("../controllers/addMerfHossGRN");
const addMerfStockRequest = require("../controllers/addMerfStockRequest");

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Returns the list of all the books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 */

router.get(
  "/distribution_date_stock_merf",
  [
    query("distributionID").notEmpty(),
    query("date").notEmpty(),
    query("itemType").notEmpty(),
  ],
  validateRequest,

  getDistributionDateStockMerf
);

router.get(
  "/hospital_date_stock",

  [
    query("hospitalID").notEmpty(),
    query("date").notEmpty(),
    query("itemType").notEmpty(),
  ],
  validateRequest,
  getHospitalDateStock
);

router.get("/merf_report", merfmlmisbincardreport);

router.post(
  "/merf_consumption",
  [
    body().isArray({ min: 1 }).withMessage("Please provdie not empty input"),
    body("*.itemID").not().isEmpty(),
    body("*.itemName").not().isEmpty(),
    body("*.unit").not().isEmpty(),
    body("*.type").not().isEmpty(),
    body("*.batchNo").not().isEmpty(),
    body("*.dispensedQuantity").not().isEmpty(),
    body("*.lossQuantity").not().isEmpty(),
    body("*.consumerID").not().isEmpty(),
    body("*.dateCreated").not().isEmpty(),
    body("*.dateModified").not().isEmpty(),
    body("*.hospitalID").not().isEmpty(),
    body("*.totalQuantity").not().isEmpty(),
    body("*.itemType").not().isEmpty(),
    body("*.expireDate").not().isEmpty(),
    body("*.unitPrice").not().isEmpty(),
    body("*.isID").not().isEmpty(),
  ],
  validateRequest,
  addMerfConsumption
);

router.post(
  "/merf_hoss_GRN",
  [
    body("grn").not().isEmpty(),
    body("grn.recieveDate").not().isEmpty(),
    body("grn.poID").not().isEmpty(),
    body("grn.hospitalID").not().isEmpty(),
    body("grn.isConfirmed").not().isEmpty(),
    body("grn.DateCreated").not().isEmpty(),
    body("grn.DateModified").not().isEmpty(),
    body("grn.isReviewed").not().isEmpty(),
    body("grn.status").not().isEmpty(),
    body("grn.totalRecieved").exists(),
    body("grn.grni").isArray(),
  ],
  validateRequest,
  addMerfHossGRN
);
router.post(
  "/merf_stock_request",
  [
    body("sr").notEmpty(),
    body("sr.srDate").notEmpty(),
    body("sr.distributionID").notEmpty(),
    body("sr.itemType").notEmpty(),
    body("sr.isConfirmed").notEmpty(),
    body("sr.DateCreated").notEmpty(),
    body("sr.DateModified").notEmpty(),
    body("sr.isReviewed").notEmpty(),
    body("sr.status").notEmpty(),
    body("sr.loginID").notEmpty(),
    body("sr.hospitalID").notEmpty(),
    body("sr.sri").isArray(),
  ],
  validateRequest,
  addMerfStockRequest
);
module.exports = router;
