import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const testimonials = [
  {
    id: 1,
    name: "Ananya Dutta",
    location: "Kolkata, India",
    rating: 5,
    text: "Foodistics has brought authentic Darjeeling tea into my home. As a Kolkata resident, I appreciate the quality and freshness. Every cup tastes like a celebration of our heritage!",
    avatar: "AD",
  },
  {
    id: 2,
    name: "Arjun Mukherjee",
    location: "Kolkata, India",
    rating: 5,
    text: "The Assam Black Tea is phenomenal! It reminds me of the morning chai from the local tea stalls, but with a premium touch. Best purchase for my daily ritual.",
    avatar: "AM",
  },
  {
    id: 3,
    name: "Priya Sharma",
    location: "Kolkata, India",
    rating: 5,
    text: "I've introduced Foodistics to all my friends in Kolkata. The variety, the packaging, and most importantly the taste - everything is top-notch. Highly recommended!",
    avatar: "PS",
  },
  {
    id: 4,
    name: "Rajesh Banerjee",
    location: "Kolkata, India",
    rating: 5,
    text: "Growing up in Kolkata, I've always been a tea connoisseur. Foodistics matches the quality of the best teas from our region. A true gem for tea lovers!",
    avatar: "RB",
  },
  {
    id: 5,
    name: "Deepika Roy",
    location: "Kolkata, India",
    rating: 5,
    text: "The Green Tea has become my daily companion. So refreshing and pure! Foodistics proves that excellent quality can be delivered right to your doorstep.",
    avatar: "DR",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    name: "",
    email: "",
    rating: 5,
    review: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewData.name || !reviewData.email || !reviewData.review) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Thank you!",
        description: "Your review has been submitted successfully. We appreciate your feedback!",
      });

      // Reset form
      setReviewData({
        name: "",
        email: "",
        rating: 5,
        review: "",
      });
      setShowReviewForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="testimonials" 
      className="relative py-24 md:py-32 bg-muted/30 overflow-hidden"
      ref={ref}
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-tea-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-tea-forest/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-tea-gold font-medium tracking-[0.3em] uppercase text-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Testimonials
          </motion.p>

          <motion.h2
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Loved by <span className="text-gradient-gold">Tea Enthusiasts</span>
          </motion.h2>

          <motion.div
            className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-tea-gold to-transparent"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Quote Icon */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-tea-gold/20">
              <Quote className="w-16 h-16" />
            </div>

            {/* Testimonial Card */}
            <div className="relative bg-card rounded-3xl p-8 md:p-12 shadow-card border border-border/50">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-tea-gold text-tea-gold" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg md:text-xl text-foreground text-center leading-relaxed mb-8 font-serif italic">
                  "{testimonials[activeIndex].text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tea-gold to-secondary flex items-center justify-center text-tea-forest font-bold">
                    {testimonials[activeIndex].avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">
                      {testimonials[activeIndex].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonials[activeIndex].location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full border border-border hover:bg-tea-gold hover:text-tea-forest hover:border-tea-gold"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex 
                        ? "w-8 bg-tea-gold" 
                        : "bg-border hover:bg-tea-gold/50"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full border border-border hover:bg-tea-gold hover:text-tea-forest hover:border-tea-gold"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Add Review Section */}
        <motion.div
          className="max-w-2xl mx-auto mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {!showReviewForm ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-6">Have you tried Foodistics tea?</p>
              <Button
                onClick={() => setShowReviewForm(true)}
                className="bg-tea-gold hover:bg-tea-gold/90 text-white rounded-full px-8 py-3"
              >
                <Send className="w-4 h-4 mr-2" />
                Share Your Review
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-card border border-border/50">
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-foreground">
                Share Your Experience
              </h3>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={reviewData.name}
                      onChange={(e) =>
                        setReviewData({ ...reviewData, name: e.target.value })
                      }
                      className="rounded-lg border-border/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={reviewData.email}
                      onChange={(e) =>
                        setReviewData({ ...reviewData, email: e.target.value })
                      }
                      className="rounded-lg border-border/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewData.rating
                              ? "fill-tea-gold text-tea-gold"
                              : "text-border"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <Textarea
                    placeholder="Share your experience with Foodistics tea..."
                    value={reviewData.review}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, review: e.target.value })
                    }
                    className="rounded-lg border-border/50 min-h-[120px]"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-tea-gold hover:bg-tea-gold/90 text-white rounded-lg"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
