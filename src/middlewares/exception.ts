import { NextFunction, Request, Response } from "express";

export const exception = [
  function (req: Request, res: Response) {
    res.status(404).json({
      status: 'failed',
      errors: ["404 not found!"]
    })
  },

  function ( err: any, req: Request, res: Response, next: NextFunction) {
    res.status(res.statusCode == 200 ? 500 : res.statusCode).json({
      status: 'failed',
      errors: [err.message]
    });
  }
]