import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const About = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, we would handle the subscription here
    alert(`Thank you for subscribing with ${email}! (This is a demo)`);
    setEmail("");
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2 lg:pr-12">
            <h2 className="font-serif text-3xl font-semibold text-gray-900 mb-6">About The Quiet Seed</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                The Quiet Seed was born from a desire to cultivate a slower, more intentional way of living in a fast-paced world. This blog is a gentle reminder that there is beauty in simplicity and wisdom in taking things slowly.
              </p>
              <p>
                Through reflective essays, mindfulness practices, personal stories, and philosophical musings, we explore the art of presence and the joy of living with intention. This is not about perfection, but about embracing the messy, beautiful journey of becoming more awake to our lives.
              </p>
              <p>
                Whether you're seeking practical tips for mindful living or deeper reflections on what it means to be fully present, The Quiet Seed offers a quiet space for contemplation and growth.
              </p>
            </div>
            
            <div className="mt-8">
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-4">About the Author</h3>
              <div className="flex items-start">
                <img className="h-20 w-20 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Author profile" />
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Olivia Gardens</h4>
                  <p className="text-gray-600 mt-1">
                    Olivia is a former tech executive who discovered the power of mindfulness during a period of burnout. Now, she writes about finding balance and meaning in our hyper-connected world. When not writing, she can be found tending to her garden, practicing yoga, or enjoying a cup of tea with a good book.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 lg:mt-0 lg:w-1/2">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img className="w-full h-auto" src="https://images.unsplash.com/photo-1599592501357-89975ab9add9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" alt="Quiet garden with lavender" />
            </div>
            
            <div className="mt-8 bg-secondary rounded-lg p-6">
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-4">Subscribe to Our Newsletter</h3>
              <p className="text-gray-600 mb-4">Join our community and receive gentle reminders to slow down, along with our latest articles and exclusive content.</p>
              
              <form className="mt-4" onSubmit={handleSubscribe}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="email" 
                    className="flex-grow px-4 py-2" 
                    placeholder="Your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                    Subscribe
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">We respect your privacy. Unsubscribe at any time.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
