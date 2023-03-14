const { validationResult } = require("express-validator");
const RequestValidationError = require("../errors/request-validation-error");

 const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  // console.log(errors)
  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }
  // console.log(errors)

  next();
};
module.exports=validateRequest
