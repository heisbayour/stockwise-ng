// src/app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://stockwise.ng";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", "/login", "/register", "/verify", "/forgot-password"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
