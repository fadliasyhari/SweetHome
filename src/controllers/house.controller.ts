import { PrismaClient } from "@prisma/client"
import { NextFunction, Request, Response } from "express"

const prisma = new PrismaClient()

export const houseController = {
  async list(req: Request, res: Response) {
    const { city, numberOfRooms, minPrice, maxPrice } = req.query
    const listOffers = await prisma.post.findMany({
      where: {
        published: true,
        ...(city ? {
          address: {
            contains: `${city}`
          }
        } : {}),
        ...(numberOfRooms ? {
          numberOfRoom: {
            gte: Number(numberOfRooms)
          }
        } : {}),
        ...(minPrice && maxPrice ? {
          price: {
            gte: Number(minPrice),
            lte: Number(maxPrice)
          }
        } : {})
      }
    })
    res.json(listOffers)
  },

  async detail(req: Request, res: Response, next: NextFunction) {
    const detailOffer = await prisma.post.findUnique({
      where: {
        id: Number(req.params.id)
      },
      include: {
        feedback: true,
        author: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    })
    if (!detailOffer) {
      next(new Error("Offer not found"))
    }
    res.json(detailOffer)
  },

  async createDraft(req: Request, res: Response, next: NextFunction) {
    const { title, address, price, image, numberOfRoom } = req.body
    if (!title || !address || !price || !image || !numberOfRoom) {
      next(new Error("please complete the data"))
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

  async publishDraft(req: Request, res: Response, next: NextFunction) {
    const houseId = Number(req.body.id)
    const detailHouse = await prisma.post.findUnique({
      where: {
        id: houseId
      },
    })
    if (!detailHouse) {
      next(new Error("Offer is not found"))
    } else {
      if (req.user && req.user.id != detailHouse.authorId) {
        next(new Error("Permission needed"))
      }
    }
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