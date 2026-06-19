import express from 'express'
import cors from 'cors'
import errorHandler from './middlewares/errorHandler'
import morgan from 'morgan';
import helmet from 'helmet'
import cookieParser from 'cookie-parser';
import AppError from './errors/AppError';
import logger from './utils/logger';
import { env } from './config/env';



const app = express()

app.use(helmet())
app.use(cors())
app.use(cookieParser())
app.use(express.json())

app.use(morgan('dev'));

app.use('/',(_req, res) => {
  res.send('Hello World!')
})

app.use((_req: express.Request,_res: express.Response, next: express.NextFunction)=> next(new AppError("Error 404 - Page Not Found",404)))
app.use(errorHandler)

export default app;