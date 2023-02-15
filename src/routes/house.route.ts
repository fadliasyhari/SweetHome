import { Router } from "express";
import { houseController } from "../controllers/house.controller";
import { authentication } from "../middlewares/authentication"

export const houseRoute = Router()

houseRoute.use(authentication)
houseRoute.get(`/list`, houseController.list)
houseRoute.get(`/detail/:id`, houseController.detail)
houseRoute.post(`/draft`, houseController.createDraft)
houseRoute.post(`/publish`, houseController.publishDraft)