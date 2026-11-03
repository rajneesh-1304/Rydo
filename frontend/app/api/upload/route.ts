import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let fileBuffer: Buffer | null = null;
    let fileName = "upload.jpg";
    let mimeType = "image/jpeg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, message: "No file provided in form data" },
          { status: 400 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      fileName = file.name || "upload.jpg";
      mimeType = file.type || "image/jpeg";
    } else {
      const body = await req.json();
      const base64Data = body.file || body.image;
      if (!base64Data) {
        return NextResponse.json(
          { success: false, message: "No base64 image data provided" },
          { status: 400 }
        );
      }
      const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        fileBuffer = Buffer.from(matches[2], "base64");
      } else {
        fileBuffer = Buffer.from(base64Data, "base64");
      }
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // If Cloudinary credentials are provided, perform real signed upload to Cloudinary
    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = "taxii_fleet";
      
      const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

      const base64Uri = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;

      const cloudinaryForm = new FormData();
      cloudinaryForm.append("file", base64Uri);
      cloudinaryForm.append("api_key", apiKey);
      cloudinaryForm.append("timestamp", timestamp.toString());
      cloudinaryForm.append("signature", signature);
      cloudinaryForm.append("folder", folder);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: cloudinaryForm,
        }
      );

      const json = await cloudinaryRes.json();
      if (!cloudinaryRes.ok || json.error) {
        return NextResponse.json(
          {
            success: false,
            message: json.error?.message || "Cloudinary upload failed",
            details: json,
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        url: json.secure_url,
        public_id: json.public_id,
        format: json.format,
        width: json.width,
        height: json.height,
        provider: "cloudinary",
      });
    }

    // Fallback: If credentials are not set yet, return local data URI with friendly notice
    const fallbackDataUri = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    return NextResponse.json({
      success: true,
      url: fallbackDataUri,
      provider: "local_preview",
      message:
        "Image processed successfully. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to frontend/.env.local for Cloudinary hosting.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
