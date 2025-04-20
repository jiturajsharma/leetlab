import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()

app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) =>{
    res.send("Hello Guys welcome to leetlab🤣")
})

app.use("/api/v1/auth", authRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on the port 8080`)
})
