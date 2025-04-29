import { Link } from "wouter";
import { Post } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <article className="post-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
      <img className="h-48 w-full object-cover" src={post.featuredImage} alt={post.title} />
      <div className="p-6">
        <div className="text-xs text-primary font-semibold tracking-wide uppercase mb-1">{post.category}</div>
        <Link href={`/post/${post.id}`}>
          <a className="block mt-2">
            <h3 className="font-serif text-xl font-semibold text-gray-900 hover:text-primary transition-colors">{post.title}</h3>
          </a>
        </Link>
        <p className="mt-3 text-gray-500 text-sm line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <time dateTime={post.publishedAt.toString()}>{formatDate(post.publishedAt)}</time>
          <span className="mx-1">&middot;</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
