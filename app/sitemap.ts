import type { MetadataRoute } from "next";
import { blogPosts } from '../services/blogContent.mjs';
import {
  localeCodes,
  publicPages,
  localizedPath,
  siteOrigin,
} from "../services/routing.ts";
export default function sitemap(): MetadataRoute.Sitemap {
  return [...localeCodes.flatMap((locale) =>
    publicPages.map((page) => ({
      url: siteOrigin + localizedPath(locale, page),
    })),
  ), ...blogPosts.map(post => ({ url: siteOrigin + localizedPath('en', `/blog/${post.slug}`) }))];
}
