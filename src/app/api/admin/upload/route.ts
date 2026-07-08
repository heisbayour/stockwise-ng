// src/app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "SUPERUSER", "AUTHOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF images are allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 5MB" }, { status: 400 });
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      console.warn("CLOUDINARY_URL not set");
      return NextResponse.json({ url: "/placeholder-cover.jpg" });
    }

    // Parse cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    if (!match) {
      return NextResponse.json({ error: "Invalid CLOUDINARY_URL format" }, { status: 500 });
    }

    const [, apiKey, apiSecret, cloudName] = match;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "stockwise/articles";

    // Cloudinary signature: SHA-1 of sorted params + api_secret (NOT HMAC)
    // Params must be sorted alphabetically, joined with &, then append api_secret
    const paramString = `folder=${folder}&timestamp=${timestamp}`;
    const toSign = paramString + apiSecret;
    const signature = createHash("sha1").update(toSign).digest("hex");

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

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      console.error("Cloudinary error:", uploadData);
      return NextResponse.json({ error: uploadData.error?.message ?? "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ url: uploadData.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}