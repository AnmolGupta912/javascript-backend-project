import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const port = process.env.PORT || 8000
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))// parser json data
app.use(express.urlencoded({extended: true, limit: "16kb"})) // parser data from encoded url
app.use(express.static("public")) // read and write static file
app.use(cookieParser()) // acess user's server cookies and proform CURD operations

// routes import 
import userRouter from "./routes/user.routes.js"


// routes decleration
app.use("/api/v1/user", userRouter)

export { app , port }