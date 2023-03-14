class CustomError extends Error {
     statusCode;

    constructor(message) {
      super(message);

      Object.setPrototypeOf(this, CustomError.prototype);
    }

    serializeErrors(){};
}
module.exports=CustomError
