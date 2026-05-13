import { Request, Response, NextFunction } from 'express';

/**
 * Middleware class for i18n setup
 * Adds a shortcut `res.locals.t` for translating messages
 */
export class I18nMiddleware {
  /**
   * Attach translation function to res.locals.t
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  static attachTranslator(req: Request, res: Response, next: NextFunction): void {
    // Prefer `req.t` (from i18n API alias), fallback to `req.__`
    res.locals.t = req.t || req.__ || ((msg: string) => msg);
    next();
  }
}
