import { Router } from "express"
import { PrismaClient } from "@prisma/client"
import { authentication } from "../middlewares/authentication"
import { orderController } from "../controllers/order.controller"

const prisma = new PrismaClient()

export const orderRoute = Router()

orderRoute.use(authentication)
orderRoute.post(`/order`, orderController.createOrder)
orderRoute.post(`/order/edit/:id`, orderController.dealOrder)