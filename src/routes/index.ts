import express from 'express';
import { feedbackRoute } from './feedback.route';
import { houseRoute } from './house.route';
import { orderRoute } from './order.route';
import { userRoute } from './user.route';

export const routes = express.Router()

routes.use("/user", userRoute)
routes.use("/house", houseRoute)
routes.use("/order", orderRoute)
routes.use("/feedback", feedbackRoute)