import { v2 as cloudinary } from "cloudinary";

const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn("Cloudinary environment variables are not configured. Image upload is disabled.");
}

export async function uploadImage(file: Buffer, folder: string): Promise<string> {
  if (!cloudinaryEnabled) {
    return "https://via.placeholder.com/400x400.png?text=Candidate+Image";
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result.secure_url);
      },
    );

    stream.end(file);
  });
}
