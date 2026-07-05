// src/app/api/admin/upload/route.ts
// Handles cover image uploads for articles
// Uses Cloudinary (free tier: 25GB) - set CLOUDINARY_URL in .env
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "SUPERUSER", "AUTHOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF images are allowed" }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 5MB" }, { status: 400 });
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      // Fallback: return a placeholder if Cloudinary isn't configured yet
      console.warn("CLOUDINARY_URL not set - returning placeholder");
      return NextResponse.json({ url: "/placeholder-cover.jpg" });
    }

    // Parse Cloudinary URL: cloudinary://api_key:api_secret@cloud_name
    const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    if (!match) return NextResponse.json({ error: "Invalid Cloudinary configuration" }, { status: 500 });

    const [, apiKey, apiSecret, cloudName] = match;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "stockwise/articles";

    // Generate signature
    const { createHmac } = await import("crypto");
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHmac("sha256", apiSecret).update(signatureString).digest("hex");

    const uploadForm = new FormData();
    uploadForm.append("file", dataUri);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp.toString());
    uploadForm.append("signature", signature);
    uploadForm.append("folder", folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadForm }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      return NextResponse.json({ error: err.error?.message ?? "Upload failed" }, { status: 500 });
    }

    const uploadData = await uploadRes.json();
    return NextResponse.json({ url: uploadData.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
