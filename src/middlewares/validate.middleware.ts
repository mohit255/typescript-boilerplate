// import { Request, Response, NextFunction } from 'express';
// import { ObjectSchema } from 'joi';

// interface CustomError extends Error {
//   status?: number;
//   code?: string;
//   details?: any;
// }

// /**
//  * Middleware for validating request data against a Joi schema
//  * @param schema Joi schema to validate
//  * @param property Part of the request to validate: 'body', 'query', or 'params'
//  */
// export const validate =
//   (schema: ObjectSchema, property: 'body' | 'query' | 'params' = 'body') =>
//   (req: Request, _res: Response, next: NextFunction): void => {
//     const { error, value } = schema.validate(req[property], {
//       abortEarly: false,
//       allowUnknown: true,
//       stripUnknown: true,
//     });

//     if (error) {
//       const errorDetails = error.details.map((detail) => ({
//         field: detail.path.join('.'),
//         message: req.__(detail.message) || detail.message,
//       }));

//       const err: CustomError = new Error(req.__('errors.validationFailed') || 'Validation failed');
//       err.status = 400;
//       err.code = 'VALIDATION_ERROR';
//       err.details = errorDetails;

//       return next(err); // 🔥 Passes error to your ErrorHandler
//     }

//     // Assign sanitized data back to request
//     req[property] = value;

//     next();
//   };
