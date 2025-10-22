import multer from "multer";

// Creating storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {  // where the uploaded file will be saved
        cb(null /* No error */, "./public/temp")  // cb is a callback
    },

    filename: function (req, file, cb) { // what the uploaded file will be named
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // to make filename unique
        
        cb(null, file.fieldname + '-' + uniqueSuffix) // e.g., avatar-1632345678901-123456789
        
    }
})

export const upload = multer({ storage })