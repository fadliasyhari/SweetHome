import { Router } from "express"
import { authentication } from "../middlewares/authentication"
import { orderController } from "../controllers/order.controller"

export const orderRoute = Router()

orderRoute.use(authentication)
orderRoute.post(`/create`, orderController.createOrder)
orderRoute.post(`/edit/:id`, orderController.dealOrder)