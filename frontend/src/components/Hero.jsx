import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Hero = () => {
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [consultForm, setConsultForm] = useState({ phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleConsultSubmit = async () => {
    if (!user) {
      toast.error("Please login or register to book a consultation");
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (!consultForm.message) {
      toast.error("Please add a message");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", "General");
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", consultForm.phone || "");
      formData.append("customNotes", consultForm.message);
      formData.append("userId", user._id);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/inquiries/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Consultation request sent!");
      setIsConsultOpen(false);
      setConsultForm({ phone: "", message: "" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden bg-slate-900 text-white">
      {/* Background Image with Parallax-like effect */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay */}
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop"
          alt="Luxury Jewelry Background"
          className="w-full h-full object-cover opacity-80"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl"
        >
          <h2 className="text-sm md:text-base font-medium tracking-[0.2em] text-blue-200 mb-4 uppercase">
            Exquisite Craftsmanship
          </h2>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Timeless Elegance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              For Every Moment
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg leading-relaxed">
            Discover our curated collection of ethically sourced diamonds and bespoke jewelry, designed to celebrate your unique story.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-white text-slate-900 hover:bg-blue-50 font-medium px-8 py-6 text-lg rounded-none"
            >
              Shop Collection
            </Button>
            <Dialog open={isConsultOpen} onOpenChange={setIsConsultOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 hover:text-white font-medium px-8 py-6 text-lg rounded-none"
                >
                  Book Consultation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Book a Consultation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {user ? (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-900">Booking as: <strong>{user.name}</strong> ({user.email})</p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-900">Please login or register to book a consultation.</p>
                    </div>
                  )}
                  
                  <Input 
                    placeholder="Phone (Optional)" 
                    value={consultForm.phone} 
                    onChange={(e) => setConsultForm({...consultForm, phone: e.target.value})} 
                  />
                  
                  <textarea 
                    className="w-full p-3 border rounded-md min-h-[100px]"
                    placeholder="Tell us what you're looking for..."
                    value={consultForm.message} 
                    onChange={(e) => setConsultForm({...consultForm, message: e.target.value})} 
                  />
                  
                  <Button className="w-full bg-navy-900" onClick={handleConsultSubmit} disabled={submitting}>
                    {submitting ? "Sending..." : "Book Consultation"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest text-white/70">Scroll</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-12 bg-gradient-to-b from-white to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default Hero;