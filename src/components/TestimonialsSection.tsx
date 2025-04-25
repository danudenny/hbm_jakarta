import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";

interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  comment: string;
  rating: number;
  image: string;
}

type TestimonialsSectionData = {
  title: string;
  subtitle: string;
  content: {
    description: string;
    testimonials: Testimonial[];
  };
  is_active: boolean;
};

const TestimonialsSection = () => {
  const [loading, setLoading] = useState(true);
  const [sectionData, setSectionData] =
    useState<TestimonialsSectionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t, i18n } = useTranslation('section.testimonials');
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    fetchTestimonialsData();
  }, []);

  const fetchTestimonialsData = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .eq("name", "testimonials")
        .single();

      if (error) throw error;

      if (data && data.is_active) {
        setSectionData(data);
      } else {
        console.warn("Testimonials section is not active or not found");
      }
    } catch (err: any) {
      console.error("Error fetching testimonials section:", err);
    } finally {
      setLoading(false);
    }
  };

  // Default testimonials as fallback
  const defaultTestimonials = [
    {
      id: "1",
      name: "John Smith",
      position: "HR Director",
      company: "Global Tech Solutions",
      comment:
        "Working with this team has been an excellent experience. They handled all our visa requirements efficiently and professionally. Highly recommended!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      position: "Operations Manager",
      company: "International Trading Co.",
      comment:
        "Their expertise in immigration matters saved us countless hours and potential complications. The team is responsive and thorough in their approach.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      id: "3",
      name: "David Chen",
      position: "CEO",
      company: "Asia Pacific Ventures",
      comment:
        "I've been using their services for over three years now, and they consistently deliver excellent results. Their knowledge of regulations is impressive.",
      rating: 4,
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
  };

  if (loading) {
    return (
      <section id="testimonials" className={`py-20 bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div
          className="container mx-auto px-4 md:px-6 flex justify-center items-center"
          style={{ minHeight: "300px" }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  // If section is not active and we're not in development mode, don't render
  if (!sectionData?.is_active && process.env.NODE_ENV !== "development") {
    return null;
  }

  // Use data from Supabase or fallback to defaults
  const title = t('title', { defaultValue: sectionData?.title || "What Our Clients Say" });
  const subtitle = t('subtitle', { defaultValue: sectionData?.subtitle || "TESTIMONIALS" });
  const description = t('description', { 
    defaultValue: sectionData?.content?.description ||
    "We take pride in our high client satisfaction rate and the positive feedback we receive from individuals and companies we've assisted with their visa and permit needs."
  });
  const testimonials =
    sectionData?.content?.testimonials && sectionData.content.testimonials.length > 0
      ? sectionData.content.testimonials
      : defaultTestimonials;

  return (
    <section id="testimonials" className={`py-20 bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h5 className="text-primary font-medium mb-3 tracking-wider">
            {subtitle}
          </h5>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
            {title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        {testimonials.length > 0 ? (
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-xl bg-white shadow-lg">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="min-w-full">
                    <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/3 flex flex-col items-center">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-24 h-24 object-cover rounded-full mb-4 border-4 border-primary/10"
                        />
                        <h4 className="font-bold text-xl text-center">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-600 text-center">
                          {testimonial.position}
                        </p>
                        <p className="text-primary font-medium text-center">
                          {testimonial.company}
                        </p>
                        <div className="flex mt-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className={
                                i < testimonial.rating
                                  ? "text-accent fill-accent"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div className="md:w-2/3">
                        <div className="mb-6">
                          <svg
                            className="w-10 h-10 text-primary/20"
                            fill="currentColor"
                            viewBox="0 0 32 32"
                            aria-hidden="true"
                          >
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                          </svg>
                        </div>
                        <p className="text-gray-700 text-lg italic mb-6">
                          {testimonial.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {testimonials.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={24} className="text-primary" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={24} className="text-primary" />
                </button>

                <div className="flex justify-center mt-6 space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentIndex ? "bg-primary" : "bg-gray-300"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No testimonials available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
