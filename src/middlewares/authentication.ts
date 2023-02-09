import { jwToken } from '../utils/jwt.util'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const authentication = async (req: any, res: any, next: any) => {
  try {
    let payload: any = await jwToken.verify(req.headers.authorization)
    req.user = await prisma.user.findUnique({
      where: { id: payload.id }
    })
    // console.log(req.user)
    if (!req.user) throw new Error()
    next()
  } catch {
    res.status(401).json({
      status: "fail",
      errors: ["Invalid Token"]
    })
  }

}

export { authentication };
