import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LingoForge",
    short_name: "LingoForge",
    description: "LingoForge - Second brain for language learning",
    start_url: "/",
    display: "standalone",
    background_color: "#3b0764",
    theme_color: "#3b0764",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
