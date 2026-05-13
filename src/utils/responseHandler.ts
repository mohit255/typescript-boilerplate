export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  statusCode: number;
}

export class ResponseHandler {
  /**
   * Send a successful response
   * @param res Express Response object
   * @param data Payload data
   * @param message Optional success message
   * @param statusCode HTTP status code (default: 200)
   */
  public static success<T>(res: any, data: T, message = 'Request successful', statusCode = 200) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response
   * @param res Express Response object
   * @param message Error message
   * @param error Optional detailed error object
   * @param statusCode HTTP status code (default: 500)
   */
  public static error(
    res: any,
    message = 'Something went wrong',
    error: any = null,
    statusCode = 500,
  ) {
    const response: ApiResponse<null> = {
      success: false,
      message,
      error,
      statusCode,
    };
    return res.status(statusCode).json(response);
  }
}
