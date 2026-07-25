import multer from "multer"

// this save the file to local storage 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)// bad practice what if the user provide 5 file of same name it maybe over write each other
  }
})

export const upload = multer({ storage })