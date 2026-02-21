import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPostBySlug, getRelatedPostsByTag } from "@/lib/blogServer";
import { Calendar, Eye, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import BlockRenderer from "@/components/editor/BlockRenderer";
import { blocksToPlainText, isTiptapJSON } from "@/components/editor/utils/migratePlainText";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = post.tags?.length
    ? await getRelatedPostsByTag(
        post.tags.map((t) => t.id),
        post.id,
        3,
      )
    : [];

  const getReadingTime = (body: string | any) => {
    if (!body) return 1;

    let plainText: string;
    if (typeof body === "string") {
      if (isTiptapJSON(body)) {
        try {
          const parsed = JSON.parse(body);
          plainText = blocksToPlainText(parsed);
        } catch {
          plainText = body;
        }
      } else {
        plainText = body;
      }
    } else {
      plainText = blocksToPlainText(body);
    }

    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <article className="max-w-3xl mx-auto px-4 py-12 max-[425px]:px-3 max-[425px]:py-8">
        <Link
          href="/blog"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-10 transition-colors max-[425px]:mb-6 max-[425px]:text-sm"
        >
          <ArrowLeft className="w-5 h-5 max-[425px]:w-4 max-[425px]:h-4" />
          Back to Blog
        </Link>

        <header className="mb-10 max-[425px]:mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-6 max-[425px]:gap-1.5 max-[425px]:mb-4">
            {post.tags?.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                className="px-3 py-1 rounded-full text-sm font-medium bg-black text-white hover:opacity-90 transition-opacity max-[425px]:px-2 max-[425px]:py-0.5 max-[425px]:text-xs"
              >
                {tag.label || tag.name}
              </Link>
            ))}
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight max-[425px]:text-2xl max-[425px]:mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm mb-8 max-[425px]:gap-4 max-[425px]:mb-6 max-[425px]:text-xs">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5" />
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5" />
              {getReadingTime(post.body)} min read
            </span>
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5" />
              {(post.views || 0).toLocaleString()} views
            </span>
          </div>

          {post.headerImage && (
            <div className="rounded-xl overflow-hidden mb-10 shadow-lg max-[425px]:mb-6 max-[425px]:rounded-lg">
              <Image
                src={post.headerImage}
                alt={post.title}
                width={1200}
                height={500}
                className="w-full h-auto max-h-[500px] object-cover"
                priority
              />
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none max-[425px]:prose-base">
          <BlockRenderer content={post.body} className="article-content" />
        </div>

        {relatedPosts.length > 0 && (
          <>
            <hr className="my-16 border-gray-200 max-[425px]:my-10" />

            <section>
              <h2
                className="text-2xl font-bold text-gray-900 mb-8 max-[425px]:text-lg max-[425px]:mb-5"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-[425px]:gap-4">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost._id || relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="block"
                  >
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow max-[425px]:rounded-lg">
                      {relatedPost.headerImage && (
                        <Image
                          src={relatedPost.headerImage}
                          alt={relatedPost.title}
                          width={400}
                          height={160}
                          className="w-full h-40 object-cover max-[425px]:h-32"
                        />
                      )}
                      <div className="p-4 max-[425px]:p-3">
                        <div className="flex flex-wrap gap-1 mb-2 max-[425px]:mb-1.5">
                          {relatedPost.tags?.slice(0, 2).map((t) => (
                            <span
                              key={t.id}
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white max-[425px]:text-[10px] max-[425px]:px-1.5"
                            >
                              {t.label || t.name}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 max-[425px]:text-sm max-[425px]:mb-1">
                          {relatedPost.title}
                        </h3>
                        <span className="text-sm text-gray-500 hover:text-black transition-colors max-[425px]:text-xs">
                          Read article →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </article>

      <Footer />
    </div>
  );
}
