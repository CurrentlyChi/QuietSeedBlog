
import { useEffect, useState } from "react";
import fruitArtwork from "@/assets/fruit-art.svg";
import { usePageContent } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { defaultAboutPageContent } from "@shared/schema";

export default function About() {
  const { data: pageContent, isLoading, error } = usePageContent("about");

  return (
    <div className="animate-fade-in">
      <section className="max-w-4xl mx-auto prose prose-headings:font-serif prose-headings:text-primary-foreground prose-p:text-foreground">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 mb-6" />
            <Skeleton className="h-60 w-full rounded-2xl mb-8" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-red-50 text-red-500">
            <p>Error loading About page content. Please try again later.</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-6">
              {pageContent?.title || "About The Quiet Seed"}
            </h1>
            
            <div className="h-60 w-full rounded-2xl overflow-hidden mb-8 flex items-center justify-center bg-[#E6D7FF]">
              <img 
                src={fruitArtwork}
                alt="Fruit artwork illustration" 
                className="w-auto h-full object-contain"
              />
            </div>
            
            <div 
              className="mb-8" 
              dangerouslySetInnerHTML={{ __html: pageContent?.content || ""}}
            />
          </>
        )}
      </section>
    </div>
  );
}
