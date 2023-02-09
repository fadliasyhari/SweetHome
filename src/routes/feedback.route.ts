import { Router } from "express";
import { feedbackController } from "../controllers/feedback.controller";
import { authentication } from "../middlewares/authentication";

export const feedbackRoute = Router()

feedbackRoute.use(authentication)
feedbackRoute.post('/create', feedbackController.createFeedback)
feedbackRoute.post('/delete/:id', )
feedbackRoute.get('/list/:id', feedbackController.listFeedback)
feedbackRoute.get('/detail/:id', feedbackController.detailFeedback)