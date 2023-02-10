import { authentication } from "../middlewares/authentication";
import { Router } from "express";

import { userController } from "../controllers/user.controller";

export const userRoute = Router()

userRoute.post(`/register`, userController.register)
userRoute.post(`/login`, userController.login)
userRoute.post('/send-code', userController.sendOTP);
userRoute.post('/verify-code', userController.verifyCode);

userRoute.get('/list-tenant', authentication, userController.getAllTenant)
userRoute.get('/list-owner', authentication, userController.getAllOwner)