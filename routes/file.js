const { Router } = require("express");
const cloudinary = require("../core/cloudinary");
const multer = require("../core/multer");

const route = Router();

route.post("/", multer.single("file"), (req, res) => {
  try {
    const file = req.file;
    if (file.size / 1024 / 1024 > 70) {
      return res
        .status(400)
        .json({ status: "error", message: `${file.name} is to big` });
    }
    cloudinary.v2.uploader
      .upload_stream({ resource_type: "auto" }, async (error, result) => {
        if (error || !result) {
          return res.status(500).json({
            status: "error",
            message: error || "upload error",
          });
        }

        return res.json({
          status: "success",
          data: result.url,
        });
      })
      .end(file.buffer);
  } catch (error) {
    return res.status(500).json({ status: "error", message: error });
  }
});

module.exports = route;
