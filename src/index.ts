import { Role } from '@prisma/client'
import * as dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import { exception } from './middlewares/exception'

import { routes } from './routes'

type ReqUser = {
  id: number,
  name: string,
  phone: string,
  role: Role,
} | null

declare global {
  namespace Express {
    interface Request {
      user: ReqUser
    }
  }
}

const app = express()
dotenv.config()

app.use(morgan('tiny'))
app.use(express.json())
app.use('/', routes)

exception.forEach(handler => app.use(handler))

app.listen(process.env.PORT || 3000, () =>
  console.log(`REST API server ready at: http://localhost:${process.env.PORT}`),
)