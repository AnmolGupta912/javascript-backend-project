import mongoose from "mongoose";
import { DB_NAME } from "../constands.js";

// import { User } from "../models/user.model.js";

// to solve this error MONGODB connection FAILED: Error: querySrv ECONNREFUSE
// i have added this and its works
import dns from "node:dns/promises";   
dns.setServers(["1.1.1.1", "1.0.0.1"]);   


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected: HOST: ${connectionInstance.connection.host}`);
        // console.log(`MongoDB connected: Name: ${connectionInstance.connection.name}`);
        // console.log(`MongoDB connected: ${connectionInstance}`);


        // test start
        // const user = await User.create({
        //     fullName: "  theanmol ",
        //     username: "Anmol",
        //     email: "anmol@example.com",
        //     password: "12345678",
        //     avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZLiDzOwzVVxlpY-1q0ElGEiZ43hV-MwnAbuaGY8KzOg&s=10",
        //     });
        // console.log(user);
        // await user.save();
        // test end

        // console.log(connectionInstance)
        
    } catch (error) {
        console.log("MONGODB connection FAILED:", error)
        process.exit(1)
    }
}

export default connectDB