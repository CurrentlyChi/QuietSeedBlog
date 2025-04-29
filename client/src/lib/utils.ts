import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncateHTML(html: string, maxLength: number): string {
  const plainText = html.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) return plainText;
  
  return plainText.substring(0, maxLength) + '...';
}

export function getReadingTime(content: string): string {
  // Remove HTML tags and trim spaces
  const text = content.replace(/<[^>]*>/g, '').trim();
  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;
  const numberOfWords = text.split(/\s/g).length;
  const minutes = Math.ceil(numberOfWords / wordsPerMinute);
  
  return `${minutes} min read`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}