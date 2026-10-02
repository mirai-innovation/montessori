import { useState } from "react";
import { Link } from "react-router-dom";

/** Imagen con marcador visual mientras la foto aún no existe o falla al cargar */
export function PostImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return (
      <div className={`post-img post-img--empty ${className}`} role="img" aria-label={alt}>
        <span>Foto próximamente</span>
      </div>
    );
  }
  return <img className={`post-img ${className}`} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export function PostMeta({ post }) {
  return (
    <div className="post-meta">
      {post.dateLabel && (
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
          {post.dateLabel}
        </span>
      )}
      {post.location && (
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
          {post.location}
        </span>
      )}
    </div>
  );
}

export function JourneyCard({ post }) {
  return (
    <Link to={`/mi-camino/${post.slug}`} className="journey-card">
      <div className="journey-card-photo">
        <PostImage src={post.cover} alt={post.coverAlt} />
        {post.tag && <span className="journey-tag">{post.tag}</span>}
      </div>
      <div className="journey-card-body">
        <PostMeta post={post} />
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <span className="journey-more">Leer experiencia →</span>
      </div>
    </Link>
  );
}
