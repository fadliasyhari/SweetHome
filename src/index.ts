import * as dotenv from 'dotenv'
import express from 'express'

import { routes } from './routes'

const app = express()
dotenv.config()

app.use(express.json())
app.use('/', routes)

app.listen(process.env.PORT || 3000, () =>
  console.log(`REST API server ready at: http://localhost:${process.env.PORT}`),
)