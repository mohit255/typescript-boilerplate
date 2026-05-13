import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    t?: (_key: string, _options?: any) => string;
    __?: (_key: string, ..._args: any[]) => string;
  }

  interface Response {
    locals: {
      t: (_key: string, _options?: any) => string;
    };
  }
}
