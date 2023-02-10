import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"

const prisma = new PrismaClient()

export const houseController = {
  async list(req: Request, res: Response) {
    const { city, numberOfRooms } = req.query
    const publishedList = await prisma.post.findMany({
      where: { published: true }
    })

    res.json(publishedList)
  },

  async createDraft(req: Request, res: Response) {
    const { title, address, price, image, numberOfRoom } = req.body
    if(!title || !address || !price || !image || !numberOfRoom) {
      throw new Error("please complete the data")
    }
    let createdDraft: any
    if (req.user) {
      createdDraft = await prisma.post.create({
        data: {
          title,
          address,
          price,
          image,
          numberOfRoom, 
          published: false,
          author: { connect: { id: req.user.id } },
        },
      })
    }
    res.json({ result: createdDraft })
  },

  async publishDraft(req: any, res: any) {
    const houseId = Number(req.param.id)
    await prisma.post.update({
      data: {
        published: true
      },
      where: {
        id: houseId
      }
    })
    res.json({
      message: `House Draft with Id: ${houseId} has successfully posted`
    })
  }
}