import Newsletter from "@/components/home/Newsletter";

export default function About() {
  return (
    <div className="animate-fade-in">
      <section className="max-w-4xl mx-auto prose prose-headings:font-serif prose-headings:text-primary-foreground prose-p:text-foreground">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-6">About The Quiet Seed</h1>
        
        <div className="h-60 w-full rounded-2xl overflow-hidden mb-8">
          <img 
            src="https://images.unsplash.com/photo-1508214854206-19cbf82a85c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" 
            alt="Lavender field at sunrise" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <h2>Our Philosophy</h2>
        
        <p>
          The Quiet Seed began as a personal journal—a place to explore and document a growing interest in mindfulness, 
          intentional living, and the surprising richness of a slower pace. What started as private reflections 
          gradually evolved into a desire to create a space where these ideas could be shared and cultivated within 
          a community of kindred spirits.
        </p>
        
        <p>
          In a world that often glorifies busyness and constant productivity, we believe there's profound value in 
          slowing down, in creating space for reflection, and in savoring the quiet moments that might otherwise 
          pass unnoticed. We believe that a life well-lived isn't measured by how much we accumulate or achieve, 
          but by how deeply we connect—with ourselves, with others, and with the world around us.
        </p>
        
        <h2>What We Share</h2>
        
        <p>
          Here, you'll find thoughtful essays on mindfulness and presence, practical guides for creating moments of 
          calm in everyday life, personal stories of transformation, and philosophical explorations of what it means 
          to live with intention in modern times.
        </p>
        
        <p>
          While we draw inspiration from various contemplative traditions, our approach is secular and practical. 
          We're interested in wisdom wherever it may be found, and in translating timeless insights into accessible 
          practices for contemporary life.
        </p>
        
        <h2>About the Author</h2>
        
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center">
            <span className="text-primary-foreground text-2xl">E</span>
          </div>
          <div>
            <h3 className="text-xl font-serif text-primary-foreground mt-0">Emma Woodley</h3>
            <p className="text-muted-foreground mt-1">Writer & Mindfulness Practitioner</p>
          </div>
        </div>
        
        <p>
          I'm Emma, the writer behind The Quiet Seed. After a decade working in the fast-paced corporate world, 
          I experienced burnout that forced me to reevaluate my relationship with time, work, and wellbeing. 
          That difficult period became the catalyst for a journey toward a more mindful and intentional way of living.
        </p>
        
        <p>
          Today, I divide my time between writing, teaching mindfulness workshops, and tending to my small urban garden. 
          I'm a certified meditation instructor and hold a degree in Philosophy, though I consider my most valuable 
          education to be the ongoing practice of presence in everyday life.
        </p>
        
        <p>
          When I'm not writing or meditating, you'll likely find me hiking in the Pacific Northwest, experimenting with 
          plant-based recipes, or lost in a good book with a cup of herbal tea nearby.
        </p>
        
        <h2>Connect With Us</h2>
        
        <p>
          I believe that meaningful connection happens in the spaces between words, in the sharing of experiences, 
          and in the recognition of our common humanity. I'd love to hear from you—your thoughts, your questions, 
          your own experiences with mindfulness and intentional living.
        </p>
        
        <p>
          You can reach me directly at <a href="mailto:hello@quietseed.com" className="text-primary">hello@quietseed.com</a> or 
          connect with The Quiet Seed on Instagram, Pinterest, or Twitter where we share daily inspirations and connect 
          with our growing community.
        </p>
        
        <div className="flex space-x-6 my-8">
          <a href="#" className="text-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
            <i className="ri-instagram-line text-2xl"></i>
          </a>
          <a href="#" className="text-primary hover:text-primary-foreground transition-colors" aria-label="Pinterest">
            <i className="ri-pinterest-line text-2xl"></i>
          </a>
          <a href="#" className="text-primary hover:text-primary-foreground transition-colors" aria-label="Twitter">
            <i className="ri-twitter-x-line text-2xl"></i>
          </a>
        </div>
        
        <p>
          Thank you for being here. I hope the words you find on these pages offer both comfort and gentle 
          encouragement as you navigate your own path toward a more mindful life.
        </p>
        
        <p className="text-right italic">
          With gratitude,<br />
          Emma
        </p>
      </section>
      
      <Newsletter />
    </div>
  );
}
