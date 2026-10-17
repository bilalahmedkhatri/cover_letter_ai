import type { MetadataRoute } from "next";
import { canonicalPublicPages } from '../services/routing.ts';
export default function sitemap(): MetadataRoute.Sitemap {
  return canonicalPublicPages().map(({url})=>({url}));
}
