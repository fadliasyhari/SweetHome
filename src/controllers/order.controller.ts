import { PrismaClient } from "@prisma/client"
import { NextFunction, Request, Response } from "express"

const prisma = new PrismaClient()

export const orderController = {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    const { postId, startDate, endDate } = req.body
    if (!postId || !startDate || !endDate) {
      next(new Error("please complete the data"))
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
  },

  async listOrder(req: Request, res: Response) {
    let authorId: number
    if (req.user) {
      authorId = Number(req.user.id)
    } else {
      authorId = 0
    }
    const listOrder = await prisma.post.findMany({
      select: {
        title: true,
        address: true,
        price: true,
        image: true,
        transaction: {
          select: {
            id: true,
            tenant: {
              select: {
                name: true,
                phone: true
              }
            },
            note: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true
          }
        }
      },
      where: {
        authorId: authorId
      }
    })
    res.json(listOrder)
  },

  async detailOrder(req: Request, res: Response) {
    const orderId = Number(req.params.id)
    const detailOrder = await prisma.transaction.findUnique({
      select: {
        post: {
          select: {
            title: true,
            price: true,
            address: true,
            numberOfRoom: true,
            image: true,
          }
        },
        tenant: {
          select: {
            name: true,
            phone: true,
          }
        },
        note: true,
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true
      },
      where: {
        id: orderId
      }
    })
    res.json(detailOrder)
  }
}