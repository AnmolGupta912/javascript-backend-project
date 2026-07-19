import mongoose from "mongoose";
import { DB_NAME } from "./constands";

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
} )()