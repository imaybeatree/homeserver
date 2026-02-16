import type { RequestHandler, Response, Request } from "express";

export const authenticated =
  (handler: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next) => {

    const isAuthenticated = true //gotta figure this out in the future
    if (!isAuthenticated) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return handler(req, res, next);
  };

