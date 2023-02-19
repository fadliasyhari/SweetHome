import { jwToken } from '../utils/jwt.util'
import { PrismaClient } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'

const prisma = new PrismaClient()

const authentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let payload: any = await jwToken.verify(req.headers.authorization)
    req.user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true
      }
    })
    if (!req.user) next(new Error("user not found"))
    next()
  } catch {
    res.status(401).json({
      status: "fail",
      errors: ["Invalid Token"]
    })
  }

}

export { authentication };
