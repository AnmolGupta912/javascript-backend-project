import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadFileOnCloudinary = async (localPath) => {
    try {
        if (!localPath) return null;

        // upload the file to cloudinary from local storage to cloud 
        const reponse = await cloudinary.uploader.upload(localPath,{
            resource_type: "auto"
        })

        console.log("file is uploaded on cloudinary",reponse.url)

        fs.unlinkSync(localPath) // remove the file from the localstorage
        return reponse

    } catch (error) {
        fs.unlinkSync(localPath) 
        return null;
    }
}

export {uploadFileOnCloudinary}