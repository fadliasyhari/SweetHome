import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import bcrypt, { hash } from 'bcrypt'
import { jwToken } from './utils/jwt'
import { authentication } from './middleware/authentication'

import { twilioClient } from './utils/twilio-client'
import { redisClient } from './utils/redis-client'
import { generateRandomSixDigitsNumber } from './utils/random-number'

const prisma = new PrismaClient()
const app = express()

app.use(express.json())

app.post(`/register`, async (req, res) => {
  const { name, role, phone, password } = req.body
  const hashed = await bcrypt.hash(password, 10)
  const result = await prisma.user.create({
    data: {
      phone,
      name,
      password: hashed,
      role: role
    }
  })
  let token = jwToken.sign({ id: result.id, phone: result.phone, role: result.role })
  res.json({ name, phone, token: token })
})

app.get('/users', authentication, async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})

app.post('/send-code', async (req, res) => {
  const recipientPhoneNumber = req.body.phoneNumber;
  const randomNumber = generateRandomSixDigitsNumber();

  const message = `Hello from RumahManis! Your verification code is: ${randomNumber}`;

  await redisClient.set(recipientPhoneNumber, `${randomNumber}`, 'EX', 600);

  const response = await twilioClient.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: recipientPhoneNumber,
    body: message,
  });

  return res.json({ message: `Message sent with id: ${response.sid}` });
});

app.post('/verify-code', async (req, res) => {
  const recipientPhoneNumber = req.body.phoneNumber;
  const smsCodeReceived = req.body.smsCode;

  const value = await redisClient.get(recipientPhoneNumber);

  if (value === `${smsCodeReceived}`) {
    await redisClient.del(recipientPhoneNumber);

    return res.json({ message: 'This is a valid match!' });
  }

  return res.status(400).json({ message: `The phone number and the SMS code doesn't match.` });
});

app.post(`/login`, async (req, res) => {
  const { phone, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      phone: phone
    }
  })
  if (user) {
    const valid = await bcrypt.compare(password, user.password)
    if (valid) {
      let token = jwToken.sign({ id: user.id, phone: user.phone, role: user.role })
      res.json({ phone: user.phone, name: user.name, token: token })
    } else {
      throw new Error('login failed')
    }
  } else {
    throw new Error('login')
  }
})

app.get(`/feed`, authentication, async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true }
  })
  res.json(posts)
})

app.post(`/posts`, authentication, async (req, res) => {
  const { title, address, price, image, authorPhone } = req.body
  const result = await prisma.post.create({
    data: {
      title,
      address,
      price,
      image,
      published: false,
      author: { connect: { phone: authorPhone } },
    },
  })
  res.json(result)
})

app.post(`/order`, async (req, res) => {
  const result = await prisma.transaction.create({
    data: { ...req.body },
  })
  res.json(result)
})

app.post(`/order/edit/:id`, async (req, res) => {
  const param = Number(req.params.id)
  const result = await prisma.transaction.update({
    where: {
      id: param
    },
    data: { ...req.body },
  })
  res.json(result)
})

app.listen(process.env.PORT || 3000, () =>
  console.log(`REST API server ready at: http://localhost:${process.env.PORT}`),
)