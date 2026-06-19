import express from 'express'
import cors from 'cors'
import morgan from 'morgan';
import helmet from 'helmet'
import { env } from './config/env';


const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use(morgan('dev'));

app.use('/',(_req, res)=> res.send('Hello World!'))



export default app;