import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const shapes = [
  { name: "Round", image: "/images/round.png" },
  { name: "Princess", image: "/images/princess.png" },
  { name: "Emerald", image: "/images/emerald.png" },
  { name: "Asscher", image: "/images/asscher.png" },
  { name: "Cushion", image: "/images/cushion.png" },
  { name: "Marquise", image: "/images/marquise.png" },
  { name: "Radiant", image: "/images/radiant.png" },
  { name: "Oval", image: "/images/oval.png" },
  { name: "Pear", image: "/images/pear.png" },
  { name: "Heart", image: "/images/heart.png" },
];

const DiamondShapes = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, []);

  const handleNavigation = (shapeName) => {
    const formattedName = shapeName.toLowerCase();
    navigate(`/diamonds/${formattedName}`);
  };

  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">
            Shop by Shape
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Explore our collection of ethically sourced diamonds, available in every shape to match your unique style.
          </p>
        </div>

        <div className="relative">
          {/* Carousel Container */}
          <motion.div 
            ref={carouselRef} 
            className="cursor-grab active:cursor-grabbing overflow-hidden"
            whileTap={{ cursor: "grabbing" }}
          >
            <motion.div 
              drag="x" 
              dragConstraints={{ right: 0, left: -width }}
              className="flex gap-8 w-max px-4 md:px-0 py-4"
            >
              {shapes.map((shape) => (
                <motion.div
                  key={shape.name}
                  className="group flex flex-col items-center gap-4 min-w-[120px] md:min-w-[160px]"
                  onClick={() => handleNavigation(shape.name)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 rounded-full border border-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
                    <img
                      src={shape.image}
                      alt={shape.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      draggable="false"
                    />
                  </div>
                  <span className="text-sm md:text-base font-medium text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-wide">
                    {shape.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Hint */}
          <div className="text-center mt-8 text-xs text-gray-400 md:hidden">
            Swipe to explore
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiamondShapes;