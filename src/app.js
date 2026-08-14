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
import videoRouter from "./routes/video.route.js"
import tweetRouter from "./routes/tweet.routes.js"
import playlistRouter from "./routes/playlist.routes.js"

// routes decleration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/video", videoRouter)
app.use("/api/v1/tweet", tweetRouter)
app.use("/api/v1/playlist", playlistRouter)


export { app , port }