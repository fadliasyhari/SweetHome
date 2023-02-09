import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const orderController = {
  async createOrder(req: any, res: any) {
    const result = await prisma.transaction.create({
      data: { ...req.body },
    })
    res.json(result)
  },

  async dealOrder(req: any, res: any) {
    const param = Number(req.params.id)
    const result = await prisma.transaction.update({
      where: {
        id: param
      },
      data: { ...req.body },
    })
    res.json(result)
  }
}