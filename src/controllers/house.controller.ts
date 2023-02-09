import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const houseController = {
  async list(req: any, res: any) {
    const publishedList = await prisma.post.findMany({
      where: { published: true }
    })

    res.json(publishedList)
  },

  async createDraft(req: any, res: any) {
    const { title, address, price, image } = req.body
    const result = await prisma.post.create({
      data: {
        title,
        address,
        price,
        image,
        published: false,
        author: { connect: { id: req.user.id } },
      },
    })
    res.json(result)
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