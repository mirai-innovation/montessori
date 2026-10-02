import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Header, Footer } from "../components/Layout";
import { PostImage, PostMeta } from "../components/Journey";
import { journeyPosts } from "../../../shared/content.js";

export default function JourneyPostPage() {
  const { slug } = useParams();
  const post = journeyPosts.find((p) => p.slug === slug && p.published);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) return <Navigate to="/#mi-camino" replace />;

  return (
    <div className="app-shell">
      <Header />
      <main>
        <article className="post">
          <div className="wrap post-wrap">
            <a href="/#mi-camino" className="post-back">← Mi camino</a>
            <span className="eyebrow">{post.tag}</span>
            <h1>{post.title}</h1>
            <PostMeta post={post} />
            <div className="framed post-cover">
              <PostImage src={post.cover} alt={post.coverAlt} />
            </div>
            <div className="post-body">
              {post.body.map((block, i) =>
                block.h ? <h2 key={i}>{block.h}</h2> : <p key={i}>{block.p}</p>
              )}
            </div>
            {post.gallery.length > 0 && (
              <div className="post-gallery">
                {post.gallery.map((img) => (
                  <figure key={img.src} className="framed">
                    <PostImage src={img.src} alt={img.alt} />
                  </figure>
                ))}
              </div>
            )}
            <p className="sign post-sign">— Adriana Villalobos Silva</p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
