const sharp = require("sharp");
// for dealing with img ( resize,uplaod,change format etc)

const multer = require("multer");
// to handle multi form data

const User = require("../models/userModel");

// create the multer storage
const multerStorage = multer.memoryStorage(); // to store files as buffer objects( as arr of binary data )

// create the multer filter
//cb --> callback
const filter = (req, file, cb) => {
  // when we are dealing with img files, we  only accept jpg,jpeg,png--> mimetype:image/jpeg,image/png,image/jpg
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
    // true--> accept the uploaded file
  } else {
    cb(new Error("Not an image! Please upload an image"), false);
  }
};

// create the multer upload instance
const upload = multer({
  storage: multerStorage,
  fileFilter: filter,
});

// upload img (populate the file obj in the req)

exports.uploadImage = upload.single("photo");

// process populated file obj

exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    } else {
      // mimetype:image/jpeg,image/png,image/jpg--> we need to remove image/--> we use split
      const type = req.file.mimetype.split("/")[1];
      var timestamp = new Date().getTime();
      req.file.filename = `image-${timestamp}.${type}`;
      var filePath = `./uploads/images/${req.file.filename}`;
      await sharp(req.file.buffer) // convert the buffer to a readable stream
        .resize(500, 500) // resize the image
        .toFormat("jpeg") // convert the image to jpeg
        .jpeg({ quality: 100 }) // set the quality of the image
        .toFile(filePath); // save the image to the file system
      req.user = await User.findByIdAndUpdate(req.user._id, {
        profilePic: filePath,
      });

      res.status(200).json({ message: "Image uploaded" });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
