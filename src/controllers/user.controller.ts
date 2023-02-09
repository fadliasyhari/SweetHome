import { PrismaClient } from "@prisma/client"
import { jwToken } from "../utils/jwt.util"
import bcrypt from "bcrypt"
import { generateRandomSixDigitsNumber } from "../utils/random-number.util"
import { redisClient } from "../utils/redis-client.util"
import { twilioClient } from "../utils/twilio-client.util"

const prisma = new PrismaClient()

export const userController = {
  async register(req: any, res: any) {
    const { name, role, phone, password } = req.body
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

  async login(req: any, res: any) {
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
      throw new Error('login failed')
    }

    let token = jwToken.sign({ id: user.id, phone: user.phone, role: user.role })
    return res.json({ phone: user.phone, name: user.name, token: token })
  },

  async getAllTenant(req: any, res: any) {
    const listTenant = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true
      },
      where: {
        role: 'TENANT'
      }
    })
    res.json(listTenant)
  },

  async getAllOwner(req: any, res: any) {
    const listOwner = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true
      },
      where: {
        role: 'OWNER'
      }
    })
    res.json(listOwner)
  },

  async sendOTP(req: any, res: any) {
    const recipientPhoneNumber = req.body.phoneNumber;

    // kalo gaada phoneNumber gimana?
    const randomNumber = generateRandomSixDigitsNumber();

    const message = `Hello from RumahManis! Your verification code is: ${randomNumber}`;

    await redisClient.set(recipientPhoneNumber, `${randomNumber}`, 'EX', 600);

    const response = await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipientPhoneNumber,
      body: message,
    });

    return res.json({ message: `Message sent with id: ${response.sid}` });
  },

  async verifyCode(req: any, res: any) {
    const recipientPhoneNumber = req.body.phoneNumber;
    const smsCodeReceived = req.body.smsCode;

    // cek request body params
    const foundOTP = await redisClient.get(recipientPhoneNumber);

    if (foundOTP !== `${smsCodeReceived}`) {
      return res.status(400).json({ message: `The phone number and the SMS code doesn't match.` });
    }

    await redisClient.del(recipientPhoneNumber);
    return res.json({ message: 'This is a valid match!' });
  }
}