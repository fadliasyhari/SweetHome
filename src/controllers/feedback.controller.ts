import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"

const prisma = new PrismaClient()

export const feedbackController = {
  async createFeedback(req: Request, res: any) {
    const { title, content, houseId } = req.body
    let feedback: any
    if (req.user) {
      feedback = await prisma.feedback.create({
        data: {
          title,
          content,
          parentId: houseId,
          authorId: req.user.id
        }
      })
    }
    res.json(feedback)
  },

  async listFeedback(req: Request, res: Response) {
    const houseId = Number(req.params.houseId)
    if (!houseId) {
      throw new Error("house ID is required")
    }
    const listFeedback = await prisma.feedback.findMany({
      where: {
        parentId: houseId
      },
      select: {
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true
          }
        }
      }
    })
    res.json(listFeedback)
  },

  async detailFeedback(req: Request, res: Response) {
    const feedbackId = Number(req.params.id)
    if (!feedbackId) {
      throw new Error("feedback ID is required")
    }
    const detailFeedback = await prisma.feedback.findUnique({
      where: {
        id: feedbackId
      },
      select: {
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    })
    res.json(detailFeedback);
  },

  async deleteFeedback(req: Request, res: Response) {
    const user = req.user
    const detailFeedback = await prisma.feedback.findUnique({
      where: {
        id: Number(req.params.id)
      },
      select: {
        author: true
      }
    })
    if (detailFeedback && user != detailFeedback.author) {
      throw new Error("you don't have the permission")
    }
    await prisma.feedback.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        deletedAt: new Date().toISOString()
      }
    })
    res.json({
      message: "feedback successfully deleted"
    })
  }
}