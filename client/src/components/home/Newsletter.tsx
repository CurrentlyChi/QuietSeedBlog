import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      toast({
        title: "Thank you for subscribing!",
        description: "You have successfully joined our newsletter.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <section className="my-16 py-12 px-6 bg-secondary rounded-2xl">
      <div className="max-w-3xl mx-auto text-center">
        <i className="ri-mail-open-line text-3xl text-primary mb-2"></i>
        <h2 className="font-serif text-2xl md:text-3xl text-primary-foreground mb-4">Join the Quiet Community</h2>
        <p className="text-foreground mb-6">
          Subscribe to receive thoughtful articles, gentle guides, and mindfulness reminders directly to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder="Your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-grow px-4 py-3 border border-muted focus:ring-2 focus:ring-primary/30"
            required
          />
          <Button 
            type="submit" 
            className="whitespace-nowrap px-6 py-3" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
        <p className="text-muted-foreground text-sm mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
