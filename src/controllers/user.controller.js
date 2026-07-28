import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"
import { ApiRespone } from '../utils/ApiRespone.js'


const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    // req.body is for form/direct json data
    const {fullName, email, username, password} = req.body
    console.log("Email:", email);
    

    // here we can also do it one by one checking
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        // The some() method of Array instances returns true if it finds an element in the array that satisfies the provided testing function. Otherwise, it returns false.

        throw new ApiError(400, "all field are required !!!")
    }

    // User.findOne({email}) this is good if only checking by one field 
    const existedUser = User.findOne({
        $or: [ { username }, { email } ]
    })
    
    if (existedUser) throw new ApiError(409, "User with same email or username already exists !!!")

    // req.files it is extra methods provided by multer
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadFileOnCloudinary(avatarLocalPath)
    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath)


    if (!avatar) {
        // checking avater is uploaded in cloudinary as it is required field
        throw new ApiError(400, "Avatar is required")
    }


    // we dont have to apply try-catch
    // creating a user object and entry in db 
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refershToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user!!!")
    }

    return res.status(201).json(
        new ApiRespone(200, createdUser, "User registered successfully!!! ")
    )
})

export {
    registerUser
}