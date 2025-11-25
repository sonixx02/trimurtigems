import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  { title: "Engagement Rings", image: `${import.meta.env.BASE_URL}images/EngagementRings.jpg`, path: "/jewelry?category=Ring" },
  { title: "Wedding Rings", image: `${import.meta.env.BASE_URL}images/wedingRings.png`, path: "/jewelry?category=Ring" },
  { title: "Diamonds", image: `${import.meta.env.BASE_URL}images/Diamonds.png`, path: "/diamonds" },
  { title: "Diamond Jewelry", image: `${import.meta.env.BASE_URL}images/DiamondJewelry.png`, path: "/jewelry" },
  { title: "Lab Grown Diamonds", image: `${import.meta.env.BASE_URL}images/labGrown.png`, path: "/diamonds" },
  { title: "Earrings", image: `${import.meta.env.BASE_URL}images/Earrings.png`, path: "/jewelry?category=Earrings" },
  { title: "Necklaces", image: `${import.meta.env.BASE_URL}images/Necklaces.png`, path: "/jewelry?category=Necklace" },
  { title: "Design Your Own", image: `${import.meta.env.BASE_URL}images/designurOwn.png`, path: "/jewelry" },
  { title: "All Jewelry", image: `${import.meta.env.BASE_URL}images/AllJewlery.png`, path: "/jewelry" },
];

const ExploreSection = () => {
  const carouselRef = useRef(null);
  const [width, setWidth] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, []);

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">
              Explore Our Collections
            </h2>
            <p className="text-gray-600 text-lg">
              From timeless classics to modern statements, discover the perfect piece for every occasion.
            </p>
          </div>
          <div 
            className="hidden md:flex gap-2 text-sm font-medium text-blue-600 items-center cursor-pointer hover:text-blue-800 transition-colors"
            onClick={() => navigate('/jewelry')}
          >
            VIEW ALL COLLECTIONS <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <motion.div 
          ref={carouselRef} 
          className="cursor-grab active:cursor-grabbing"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div 
            drag="x" 
            dragConstraints={{ right: 0, left: -width }}
            className="flex gap-6 w-max pb-8"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                className="relative group w-64 h-80 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(category.path)}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white text-xl font-medium font-serif mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {category.title}
                  </h3>
                  <div className="h-0.5 w-0 bg-white group-hover:w-12 transition-all duration-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreSection;