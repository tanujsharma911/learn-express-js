import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")  // specify your upload directory here, cb is a callback
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // to make filename unique
        
        cb(null, file.fieldname + '-' + uniqueSuffix)

        console.log('Multer :: File uploaded:', file.url);
        
    }
})

export const upload = multer({ storage })