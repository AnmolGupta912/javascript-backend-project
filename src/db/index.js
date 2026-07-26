import mongoose from "mongoose";
import { DB_NAME } from "../constands.js";

// to solve this error MONGODB connection FAILED: Error: querySrv ECONNREFUSE
// i have added this and its works
import dns from "node:dns/promises";   
dns.setServers(["1.1.1.1", "1.0.0.1"]);   


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected: HOST: ${connectionInstance.connection.host}`);
        // console.log(connectionInstance)
        
    } catch (error) {
        console.log("MONGODB connection FAILED:", error)
        process.exit(1)
    }
}

export default connectDB