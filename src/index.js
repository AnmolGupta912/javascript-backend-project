import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app, port } from "./app.js";


dotenv.config({path: "./env"})  // this is imp without this env will not load


connectDB()  // when db is connected it return a promiss
.then( () => {
    app.on("ERROR", (err) => {
        console.log("ERROR", error)
        throw error
    })
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`)
    })
})
.catch((err) => {
    console.log(`MONGO db connection FAILED !!!`, err)
})



















/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("ERROR", (error) => {
            console.log("ERROR", error)
            throw error
        })
        app.listen(process.env.PORT,() => {
            console.log(`app is listening on port ${process.env.PORT}`);
        })
        
    } catch (error) {
        console.log("ERROR", error);
        throw error
    }
} )()*/