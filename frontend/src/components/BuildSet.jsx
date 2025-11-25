import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const BuildSet = () => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState(['Ring', 'Necklace', 'Earrings']);
  const [selectedItems, setSelectedItems] = useState({});
  const [availableItems, setAvailableItems] = useState({});
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
  const [customNotes, setCustomNotes] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch all items and filter client-side
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jewelry`);
        // Assuming res.data is an array of jewelry items
        const allJewelry = Array.isArray(res.data) ? res.data : (res.data.jewelry || []);
        
        const items = {};
        categories.forEach(cat => {
            items[cat] = allJewelry.filter(item => item.category === cat);
        });
        
        setAvailableItems(items);
      } catch (e) {
        console.error("Failed to fetch jewelry for build set:", e);
        toast.error("Could not load jewelry items");
      }
    };
    fetchItems();
  }, []);

  const handleSelectItem = (category, item) => {
    setSelectedItems({ ...selectedItems, [category]: item });
  };

  const handleSubmit = async () => {
    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      toast.error("Please fill in all contact details");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", "Set");
      formData.append("name", contactInfo.name);
      formData.append("email", contactInfo.email);
      formData.append("phone", contactInfo.phone);
      formData.append("customNotes", `Set Composition: ${Object.entries(selectedItems).map(([cat, item]) => `${cat}: ${item.name}`).join(', ')}. \nUser Notes: ${customNotes}`);
      
      if (attachments && attachments.length > 0) {
        Array.from(attachments).forEach(file => {
            formData.append("attachments", file);
        });
      }
      
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/inquiries/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Set inquiry submitted!");
      setStep(3); // Success step
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif text-center mb-8">Build Your Perfect Set</h1>
        
        {step === 1 && (
          <div className="space-y-12">
            {categories.map(cat => (
              <div key={cat} className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-serif mb-4">Select a {cat}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availableItems[cat]?.map(item => (
                    <div 
                      key={item._id} 
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedItems[cat]?._id === item._id ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-gray-300'}`}
                      onClick={() => handleSelectItem(cat, item)}
                    >
                      <img src={`${import.meta.env.VITE_BACKEND_URL}${item.images[0]}`} className="w-full h-32 object-cover rounded mb-2" alt={item.name} />
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-gray-500 text-xs">${item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Selected Items:</p>
                <p className="font-medium">{Object.keys(selectedItems).length} / {categories.length}</p>
              </div>
              <Button 
                size="lg" 
                className="bg-navy-900"
                disabled={Object.keys(selectedItems).length === 0}
                onClick={() => setStep(2)}
              >
                Proceed to Inquiry
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-serif mb-6">Complete Your Inquiry</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Your Selection:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(selectedItems).map(([cat, item]) => (
                    <li key={cat} className="text-sm text-gray-700">
                      <span className="font-semibold">{cat}:</span> {item.name} (${item.price.toLocaleString()})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <textarea 
                  className="w-full p-3 border rounded-md"
                  placeholder="Any specific requirements for this set? (e.g., matching metals, specific diamonds...)"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Images, Video, PDF)</label>
                  <input 
                    type="file" 
                    multiple
                    accept="image/*,video/*,application/pdf"
                    onChange={(e) => setAttachments(e.target.files)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="p-3 border rounded-md w-full"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="p-3 border rounded-md w-full"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    className="p-3 border rounded-md w-full md:col-span-2"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 bg-navy-900" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-20">
            <h2 className="text-3xl font-serif text-green-600 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-8">We have received your request for a custom set. Our team will review it and contact you shortly.</p>
            <Button onClick={() => window.location.href = '/'}>Return Home</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildSet;
