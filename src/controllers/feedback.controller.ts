import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const feedbackController = {
  async createFeedback(req: any, res: any) {
    const { title, content, houseId } = req.body
    const feedback = await prisma.feedback.create({
      data: {
        title,
        content,
        parentId: houseId,
        authorId: req.user.id
      }
    })
    res.json(feedback)
  },

  async listFeedback(req: any, res: any) {
    const houseId = Number(req.param.id)
    if (!houseId) {
      throw new Error("house ID is required")
    }
    const listFeedback = await prisma.feedback.findMany({
      where: {
        parentId: houseId
      },
      include: {

        author: true
      }
    })
    res.json(listFeedback)
  },

  async detailFeedback(req: any, res: any) {
    const feedbackId = Number(req.param.id)
    if (feedbackId) {
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
            name: true
          }
        }
      }
    })
    res.json(detailFeedback);
  },

  async deleteFeedback(req: any, res: any) {
    const user = req.user
    const detailFeedback = await prisma.feedback.findUnique({
      where: {
        id: Number(req.param.id)
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
        id: Number(req.param.id)
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