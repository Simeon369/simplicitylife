import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BlogFilter from "@/components/BlogFilter";
import { getAllPublishedPosts, getAllTags } from "@/lib/blogServer";

export const revalidate = 0;

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([
    getAllPublishedPosts(),
    getAllTags(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Nav />
      <BlogFilter posts={posts} tags={tags} />
      <Footer />
    </div>
  );
}
