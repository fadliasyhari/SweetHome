import { PrismaClient, Role } from "@prisma/client"
import { jwToken } from "../utils/jwt.util"
import bcrypt from "bcrypt"
import { generateRandomSixDigitsNumber } from "../utils/random-number.util"
import { redisClient } from "../utils/redis-client.util"
import { twilioClient } from "../utils/twilio-client.util"
import { NextFunction, Request, Response } from "express"

const prisma = new PrismaClient()

export const userController = {
  async register(req: Request, res: Response, next: NextFunction) {
    const { name, role, phone, password } = req.body
    if (!name || !phone || !role || !password) {
      next(new Error("please complete the data"))
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const createdUser = await prisma.user.create({
      data: {
        phone,
        name,
        password: hashedPassword,
        role
      }
    })
    let token = jwToken.sign({ id: createdUser.id, phone: createdUser.phone, role: createdUser.role })
    res.json({ name, phone, token: token })
  },

  async login(req: Request, res: Response, next: NextFunction) {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        phone: phone
      }
    })

    if (!user) {
      return res.status(401).json({ message: 'User/password not valid' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      next(new Error('login failed'))
    }

    let token = jwToken.sign({ id: user.id, phone: user.phone, role: user.role })
    res.json({ phone: user.phone, name: user.name, token: token })
  },

  async getAllTenant(_req: Request, res: Response,) {
    const listTenant = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true
      },
      where: {
        role: Role.TENANT
      }
    })
    res.json({ result: listTenant })
  },

  async getAllOwner(_req: Request, res: Response) {
    const listOwner = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true
      },
      where: {
        role: Role.OWNER
      }
    })
    res.json({ result: listOwner })
  },

  async sendOTP(req: Request, res: Response, next: NextFunction) {
    const recipientPhoneNumber = req.body.phoneNumber;

    if (!recipientPhoneNumber) {
      next(new Error("phone number is required"))
    }
    const randomNumber = generateRandomSixDigitsNumber();

    const message = `Hello from RumahManis! Your verification code is: ${randomNumber}`;

    await redisClient.set(recipientPhoneNumber, `${randomNumber}`, 'EX', 600);

    const response = await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipientPhoneNumber,
      body: message,
    });

    res.json({ message: `Message sent with id: ${response.sid}` });
  },

  async verifyCode(req: Request, res: Response, next: NextFunction) {
    const recipientPhoneNumber = req.body.phoneNumber;
    const smsCodeReceived = req.body.smsCode;

    if (!smsCodeReceived) {
      next(new Error("OTP code is required"))
    }

    const foundOTP = await redisClient.get(recipientPhoneNumber);

    if (foundOTP !== `${smsCodeReceived}`) {
      res.status(400).json({ message: `The phone number and the SMS code doesn't match.` });
    }

    await redisClient.del(recipientPhoneNumber);
    res.json({ message: 'This is a valid match!' });
  }
}