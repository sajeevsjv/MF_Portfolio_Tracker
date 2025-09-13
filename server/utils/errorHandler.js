import {errorResponse} from "./responseHandler.js";
const  errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

 let response = errorResponse({
    statusCode,
    message
  });
  res.status(response.statusCode).json(response);
};

export default errorHandler;