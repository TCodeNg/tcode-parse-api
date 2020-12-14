import { BaseController } from "base.controller";
import express from "express";
import { v2 } from "cloudinary";
import { multer } from "./utils/multer";
import * as path from "path";
import { validateUser } from "./utils/validate.user.middleware";

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export class MediaController implements BaseController {
  router: express.Router;
  cloudinary = v2;
  imageFolder = process.env.TCODE_IMAGE_FOLDER || "tcode-dev";

  constructor(router: express.Router, config: CloudinaryConfig) {
    this.router = router;
    this.cloudinary.config(config);
    this.initRoutes(this.router);
  }

  private initRoutes(router: express.Router) {
    this.initImageUploader(router);
  }

  private initImageUploader(router: express.Router) {
    const upload = multer(undefined, (req, file, cb) => {
      let ext = path?.extname(file.originalname);
      if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
        cb(new Error("File type is not supported"));
        return;
      }
      cb(null, true);
    });
    router.post(
      "/upload/image",
      validateUser,
      upload.single("image"),
      async (req, res) => {
        try {
          const {
            public_id,
            width,
            height,
            secure_url: image,
          } = await this.cloudinary.uploader.upload(req.file.path, {
            allowed_formats: ["png", "jpg"],
            access_mode: "public",
            folder: this.imageFolder,
          });
          res.send({
            image: {
              thumb: this.cloudinary.url(public_id, {
                width: 150,
                height: 150,
                crop: "fill",
              }),
              width,
              height,
              image,
              public_id,
            },
          });
        } catch (e) {
          res.status(Number.isInteger(e.status) ? e.status : 400).send({
            error: e,
          });
        }
      }
    );
  }
}
