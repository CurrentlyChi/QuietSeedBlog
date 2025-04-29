import { Link } from "wouter";
import { Post } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface FeaturedPostProps {
  post: Post;
}

const FeaturedPost = ({ post }: FeaturedPostProps) => {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-md mb-16 post-card bg-white">
      <div className="md:flex">
        <div className="md:shrink-0">
          <img className="h-full w-full object-cover md:w-72" src={post.featuredImage} alt={post.title} />
        </div>
        <div className="p-8">
          <div className="uppercase text-xs text-primary font-semibold tracking-wide mb-1">Featured • {post.category}</div>
          <Link href={`/post/${post.id}`}>
            <a className="block mt-1">
              <h2 className="font-serif text-3xl font-semibold text-gray-900 hover:text-primary transition-colors mb-3">{post.title}</h2>
            </a>
          </Link>
          <p className="mt-2 text-gray-600 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="mt-6 flex items-center">
            <div className="flex-shrink-0">
              <img className="h-10 w-10 rounded-full" src={post.authorImage} alt="Author profile" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{post.author}</p>
              <div className="flex space-x-1 text-sm text-gray-500">
                <time dateTime={post.publishedAt.toString()}>{formatDate(post.publishedAt)}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPost;
