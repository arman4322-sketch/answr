import type { Metadata } from "next";
import BlogClient from "./BlogClient";
import "./page.css";

export const metadata: Metadata = { title: "Blog" };

/* Blog index — converted from canvas frame #blog.
   Interactivity pass: category pills filter the fixture posts, "Load 12 more"
   swaps to an inline caught-up caption, newsletter subscribe swaps to an
   inline success line — all in BlogClient (client). Markup/copy verbatim. */
export default function BlogPage() {
  return (
    <div className="frame-blog">
      <BlogClient />
    </div>
  );
}
