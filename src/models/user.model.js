import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt  from 'jsonwebtoken'


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required..."]
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar:{
            type: String, // cloudinary url
            required: true
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        coverImage: {
            type: String, // cloudinary url
        },
        refershToken: {
            type: String
        }
    },
    {
        timestamps: true
    }

)


// we do not use the arrow function here bcuz u cant acess the password then 
// .pre is the method that excute one after another  its a middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    // next() ?? this give me a type err : next is not a func
})



// these is only avail on user created by expotred User model 

// this is the custom method to check is the password is correct 
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// this method jwt.sign is use to make the token 
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}



userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)