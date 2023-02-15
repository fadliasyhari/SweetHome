import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"

const prisma = new PrismaClient()

export const orderController = {
  async createOrder(req: Request, res: Response) {
    const { postId, startDate, endDate } = req.body
    if (!postId || !startDate || !endDate) {
      throw new Error("please complete the data")
    }
    const note = req.body.note ? req.body.note : ""
    let user: any
    if (req.user) {
      user = req.user
    }
    const orderCreate = await prisma.transaction.create({
      data: {
        postId: postId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        tenantId: user.id,
        note: note,
        status: 0
      },
    })
    res.json(orderCreate)
  },

  async dealOrder(req: Request, res: Response) {
    const orderId = Number(req.params.id)
    await prisma.transaction.update({
      where: {
        id: orderId
      },
      data: {
        status: req.body.status
      },
    })
    res.json({ message: "Order status successfully changed" })
  }
}