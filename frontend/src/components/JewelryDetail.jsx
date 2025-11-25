import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Environment, ContactShadows, Html, MeshRefractionMaterial, Caustics } from '@react-three/drei';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from './Navbar';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X, ZoomIn, FileText, FileIcon, Trash2, Heart } from "lucide-react";
import { useCompare } from "../hooks/useCompare";
import { useAuth } from "../context/AuthContext";

// Scene Setup for Premium Look
const SceneSetup = ({ children }) => {
  return (
    <>
      <Environment preset="city" background={false} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <ContactShadows resolution={1024} scale={10} blur={1} opacity={0.5} far={10} color="#000000" />
      {children}
    </>
  );
};

// 3D Model Component
const Model = ({ url, scale = 1, position = [0, 0, 0] }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={scale} position={position} />;
};

// Diamond Model Component - EXACT copy from DiamondView.jsx
const DiamondModel = ({ shape: shapeProp, materialProps }) => {
  const modelRef = useRef();
  const [model, setModel] = useState(null);
  const { scene: originalScene } = useGLTF(`${import.meta.env.BASE_URL}images/GemstoneAssets.glb`);

  const texture = useLoader(
    RGBELoader,
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr"
  );

  // Create a direct mapping between URL shape names and GLB model names
  const shapeToModelName = {
    round: "Gem_RoundBrilliant",
    princess: "Gem_Square",
    cushion: "Gem_Cushioned_Square",
    oval: "Gem_Oval",
    emerald: "Gem_Rectangular",
    radiant: "Gem_SquareCornered",
    asscher: "Gem_Octangle",
    marquise: "Gem_Marquise",
    pear: "Gem_Tear_Drop",
    heart: "Gem_HeartSimple",
    triangle: "Gem_Triangle",
    trilliant: "Gem_Trilliant",
    trapizoid: "Gem_Trapizoid",
    hexangular: "Gem_Hexangular",
    octangle: "Gem_Octangle",
    square: "Gem_Square",
    rectangular: "Gem_Rectangular",
    tear: "Gem_Tear_Drop",
    heartcomplex: "Gem_HeartComplex",
    cushionedround: "Gem_Cushioned_Round",
    cushionedrectangular: "Gem_Cushioned_Rectangular",
  };

  useEffect(() => {
    if (originalScene && shapeProp) {
      // Clone the scene to avoid mutating the original
      const clonedScene = originalScene.clone();
      let selectedModel = null;

      // Find the specific model by name
      const targetName = shapeToModelName[shapeProp.toLowerCase()];

      if (targetName) {
        clonedScene.traverse((child) => {
          if (child.isMesh && child.name === targetName) {
            selectedModel = child;
          }
        });
      }

      if (!selectedModel) {
        // Fallback to first mesh if specific model not found
        clonedScene.traverse((child) => {
          if (child.isMesh && !selectedModel) {
            selectedModel = child;
          }
        });
      }

      if (selectedModel) {
        // Bake the world matrix into the geometry
        const geometry = selectedModel.geometry.clone();
        geometry.applyMatrix4(selectedModel.matrixWorld);

        // Compute the bounding box of the baked geometry
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox.clone();
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // Center the geometry at the origin
        geometry.translate(-center.x, -center.y, -center.z);

        setModel({ geometry });
      } else {
        console.error(`No diamond model found for shape: ${shapeProp}`);
      }
    }
  }, [originalScene, shapeProp, shapeToModelName]);

  if (!model) return null;

  return (
    <group ref={modelRef} scale={1.5}>
      <Caustics
        backfaces
        color={materialProps?.color || "#ffffff"}
        position={[0, -0.5, 0]}
        lightSource={[5, 5, 5]}
        worldRadius={0.1}
        ior={materialProps?.ior || 2.42}
        intensity={0.2}
      >
        <mesh castShadow geometry={model.geometry}>
          <MeshRefractionMaterial
            envMap={texture}
            bounces={materialProps?.bounces || 3}
            aberrationStrength={materialProps?.aberrationStrength || 0.01}
            ior={materialProps?.ior || 2.42}
            fresnel={materialProps?.fresnel || 1}
            color={materialProps?.color || "#ffffff"}
            transmission={materialProps?.transmission || 0.9}
            toneMapped={false}
            fastChroma
          />
        </mesh>
      </Caustics>
    </group>
  );
};

// Diamond Selector Component (Mini List)
const DiamondSelector = ({ onSelect }) => {
  const [diamonds, setDiamonds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiamonds = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds`);
        setDiamonds(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchDiamonds();
  }, []);

  if (loading) return <div className="p-4">Loading diamonds...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
      {diamonds.map(d => (
        <div key={d._id} className="border rounded p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(d)}>
          <div className="flex gap-3 items-center">
            <img 
              src={`${import.meta.env.VITE_BACKEND_URL}${d.imageUrl}`} 
              alt={d.shape} 
              className="w-12 h-12 object-cover rounded"
            />
            <div>
              <p className="font-medium text-sm">{d.carat}ct {d.shape}</p>
              <p className="text-xs text-gray-500">{d.color} / {d.clarity}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm">${d.price.toLocaleString()}</p>
            <Button size="sm" variant="outline" className="h-7 text-xs mt-1">Select</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ImageGallery = ({ images, onImageClick }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  if (!images || images.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">No images available</div>;

  return (
    <div className="relative group h-full">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((src, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center bg-white" key={index}>
               <img 
                  src={`${import.meta.env.VITE_BACKEND_URL}${src}`} 
                  className="max-h-full max-w-full object-contain cursor-zoom-in transition-transform hover:scale-105 duration-500" 
                  onClick={() => onImageClick(index)}
                  alt={`View ${index + 1}`}
               />
            </div>
          ))}
        </div>
      </div>
      
      {images.length > 1 && (
        <>
          <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-6 h-6 text-navy-900" />
          </button>
          <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-6 h-6 text-navy-900" />
          </button>
        </>
      )}
      
      <button 
        className="absolute bottom-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onImageClick(0)}
      >
        <ZoomIn className="w-5 h-5 text-navy-900" />
      </button>
    </div>
  );
};

const VideoGallery = ({ videos }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [playing, setPlaying] = useState(null);

  if (!videos || videos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        No Videos Available
      </div>
    );
  }

  return (
    <div className="relative h-full group">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {videos.map((vid, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-full bg-black flex items-center justify-center" key={index}>
              <video 
                src={`${import.meta.env.VITE_BACKEND_URL}${vid}`} 
                className="max-w-full max-h-full"
                controls
                onPlay={() => setPlaying(index)}
                onPause={() => setPlaying(null)}
              />
            </div>
          ))}
        </div>
      </div>
      
      {videos.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => emblaApi && emblaApi.scrollPrev()}
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => emblaApi && emblaApi.scrollNext()}
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        </>
      )}
    </div>
  );
};

const Lightbox = ({ images, initialIndex, onClose }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex: initialIndex });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') emblaApi?.scrollPrev();
      if (e.key === 'ArrowRight') emblaApi?.scrollNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emblaApi, onClose]);

  if (!images) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
        <X className="w-8 h-8" />
      </button>
      
      <div className="w-full h-full max-w-7xl mx-auto p-4" ref={emblaRef}>
        <div className="flex h-full items-center">
          {images.map((src, index) => (
            <div className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center px-4" key={index}>
              <img 
                src={`${import.meta.env.VITE_BACKEND_URL}${src}`} 
                className="max-h-[90vh] max-w-full object-contain shadow-2xl" 
                alt={`Full view ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => emblaApi?.scrollPrev()} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4">
        <ChevronLeft className="w-10 h-10" />
      </button>
      <button onClick={() => emblaApi?.scrollNext()} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4">
        <ChevronRight className="w-10 h-10" />
      </button>
    </div>
  );
};

const StockDisplay = ({ status, quantity, showQuantity }) => {
  if (status === "Out of Stock") {
    return <span className="text-red-600 font-medium flex items-center gap-2"><span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>Out of Stock</span>;
  }
  if (status === "Call for Availability") {
    return <span className="text-orange-600 font-medium flex items-center gap-2"><span className="w-2 h-2 bg-orange-600 rounded-full"></span>Call for Availability</span>;
  }
  return (
    <span className="text-green-600 font-medium flex items-center gap-2">
      <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
      In Stock {showQuantity && quantity > 0 && <span className="text-gray-500 font-normal text-sm">({quantity} available)</span>}
    </span>
  );
};

const JewelryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jewelry, setJewelry] = useState(null);
  const [selectedDiamonds, setSelectedDiamonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState("image"); // "image", "3d", "video"

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Gemstone 3D carousel state
  const [currentGemstoneIndex, setCurrentGemstoneIndex] = useState(0);
  const [gemstones, setGemstones] = useState([]);
  const [materialProps] = useState({
    bounces: 3,
    aberrationStrength: 0.01,
    ior: 2.42,
    fresnel: 1,
    color: "#ffffff",
    transmission: 0.9,
  });

  // Customization State
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customNotes, setCustomNotes] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { user, toggleFavorite } = useAuth();

  const isFavorite = user?.favorites?.some(f => f.itemId === jewelry?._id);

  useEffect(() => {
    const fetchJewelry = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jewelry/${id}`);
        setJewelry(res.data.jewelry);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load item");
        setLoading(false);
      }
    };
    fetchJewelry();
  }, [id]);

  // Parse gemstones when jewelry loads
  useEffect(() => {
    if (jewelry?.gemstone) {
      // Split by comma and clean up
      const stones = jewelry.gemstone
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      setGemstones(stones);
      setCurrentGemstoneIndex(0);
    }
  }, [jewelry]);

  // Handle incoming diamond selection from DiamondView -> JewelryList
  const location = useLocation();
  useEffect(() => {
    if (location.state?.diamond && !selectedDiamonds.length) {
        setIsCustomizing(true);
        setSelectedDiamonds([location.state.diamond]);
        toast.success("Diamond added to your setting");
        
        // Clear state so it doesn't re-add on refresh if we were to persist state differently, 
        // but for now let's keep it simple. 
        // Ideally we might want to clear it from history but let's leave it for user experience consistency if they go back.
    }
  }, [location.state, selectedDiamonds.length]);

  const handleDiamondSelect = (diamond) => {
    if (isCustomizing) {
      setSelectedDiamonds([...selectedDiamonds, diamond]);
      toast.success("Added diamond to design");
    } else {
      setSelectedDiamonds([diamond]); // Standard mode only allows one
      toast.success("Selected diamond");
    }
    setIsDialogOpen(false);
  };

  const handleRemoveDiamond = (index) => {
    const newDiamonds = [...selectedDiamonds];
    newDiamonds.splice(index, 1);
    setSelectedDiamonds(newDiamonds);
  };

  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitInquiry = async () => {
    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      toast.error("Please fill in all contact details");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", "Single Item");
      formData.append("baseItemId", jewelry._id);
      formData.append("baseItemName", jewelry.name);
      formData.append("name", contactInfo.name);
      formData.append("email", contactInfo.email);
      formData.append("phone", contactInfo.phone);
      formData.append("customNotes", customNotes);
      formData.append("selectedDiamonds", JSON.stringify(selectedDiamonds.map(d => d._id)));
      
      if (attachments && attachments.length > 0) {
        Array.from(attachments).forEach(file => {
          formData.append("attachments", file);
        });
      }

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/inquiries/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Inquiry submitted! We will contact you shortly.");
      setIsCustomizing(false);
      setCustomNotes("");
      setAttachments([]);
      setSelectedDiamonds([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>;
  if (!jewelry) return <div className="min-h-screen flex items-center justify-center">Item not found</div>;

  const diamondsPrice = selectedDiamonds.reduce((acc, d) => acc + d.price, 0);
  const totalPrice = jewelry.price + diamondsPrice;
  const isPurchasable = jewelry.stockStatus !== "Out of Stock";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {lightboxOpen && (
        <Lightbox 
          images={jewelry.images || []} 
          initialIndex={lightboxIndex} 
          onClose={() => setLightboxOpen(false)} 
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: 3D Viewer / Images */}
          <div className="space-y-4">
            <div className="h-[600px] bg-gray-50 rounded-2xl overflow-hidden border relative shadow-inner">
               {/* View Toggle */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                  {(jewelry.threeDModelUrl || gemstones.length > 0) && (
                    <button
                      className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                        viewMode === "3d" ? "bg-navy-900 text-white shadow-lg scale-105" : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setViewMode("3d")}
                    >
                      3D VIEW
                    </button>
                  )}
                  <button
                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                      viewMode === "image" ? "bg-navy-900 text-white shadow-lg scale-105" : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setViewMode("image")}
                  >
                    IMAGES
                  </button>
                  {jewelry.videos && jewelry.videos.length > 0 && (
                    <button
                      className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                        viewMode === "video" ? "bg-navy-900 text-white shadow-lg scale-105" : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setViewMode("video")}
                    >
                      VIDEOS
                    </button>
                  )}
               </div>

              {viewMode === "3d" && (jewelry.threeDModelUrl || gemstones.length > 0) ? (
                <>
                  <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 5], fov: 45 }}>
                    <Suspense fallback={<Html center>Loading 3D Model...</Html>}>
                      <SceneSetup>
                        <Stage environment="city" intensity={0.5} contactShadow={false}>
                          {jewelry.threeDModelUrl && (
                            <Model 
                              url={`${import.meta.env.VITE_BACKEND_URL}${jewelry.threeDModelUrl}`} 
                              scale={1} 
                            />
                          )}
                          {/* Render DiamondModel for current gemstone if available */}
                          {gemstones.length > 0 && (
                            <DiamondModel shape={gemstones[currentGemstoneIndex]} materialProps={materialProps} />
                          )}
                          {selectedDiamonds.length > 0 && selectedDiamonds[0].threeDModelUrl && (
                            <Model 
                              url={`${import.meta.env.VITE_BACKEND_URL}${selectedDiamonds[0].threeDModelUrl}`} 
                              scale={0.5} 
                              position={[0, 1.2, 0]} 
                            />
                          )}
                        </Stage>
                      </SceneSetup>
                      <OrbitControls autoRotate={autoRotate} autoRotateSpeed={1} makeDefault />
                    </Suspense>
                  </Canvas>
                  
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg flex gap-4 z-10">
                     <button onClick={() => setAutoRotate(!autoRotate)} className="text-xs font-bold text-navy-900 hover:text-blue-600 uppercase transition-colors">
                        {autoRotate ? "Pause" : "Rotate"}
                     </button>
                  </div>

                  {/* Gemstone Carousel Navigation */}
                  {gemstones.length > 1 && (
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-3 z-10">
                      <button 
                        onClick={() => setCurrentGemstoneIndex((prev) => (prev > 0 ? prev - 1 : gemstones.length - 1))}
                        className="text-navy-900 hover:text-blue-600 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="text-xs font-bold text-navy-900 uppercase tracking-wider min-w-[80px] text-center">
                        {gemstones[currentGemstoneIndex]}
                      </div>
                      <button 
                        onClick={() => setCurrentGemstoneIndex((prev) => (prev < gemstones.length - 1 ? prev + 1 : 0))}
                        className="text-navy-900 hover:text-blue-600 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : viewMode === "video" ? (
                <VideoGallery videos={jewelry.videos} />
              ) : (
                <ImageGallery images={jewelry.images || []} onImageClick={handleImageClick} />
              )}
              
              {selectedDiamonds.length > 0 && viewMode === "3d" && (
                <div className="absolute top-16 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-sm border text-sm animate-in fade-in slide-in-from-top-2 z-10">
                  <p className="font-medium text-navy-900">Previewing with:</p>
                  <p>{selectedDiamonds[0].carat}ct {selectedDiamonds[0].shape} Diamond</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details & Customization */}
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-start">
                 <h1 className="text-3xl font-serif text-navy-900 mb-2">{jewelry.name}</h1>
                 <div className="flex gap-2">
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => toggleFavorite(jewelry._id, 'Jewelry')}
                       className={isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}
                     >
                       <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
                     </Button>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-navy-100 text-navy-800">
                      {jewelry.category}
                    </span>
                 </div>
              </div>
              <p className="text-gray-500 font-mono text-sm">Stock #: {jewelry.stockNumber}</p>
              
              <div className="mt-6 flex flex-col gap-2 border-b pb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-navy-900">${totalPrice.toLocaleString()}</span>
                  {selectedDiamonds.length > 0 && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">(Setting: ${jewelry.price.toLocaleString()} + Diamonds: ${diamondsPrice.toLocaleString()})</span>}
                </div>
                <StockDisplay 
                  status={jewelry.stockStatus} 
                  quantity={jewelry.stockQuantity} 
                  showQuantity={jewelry.showStockQuantity} 
                />
              </div>

              <div className="mb-6">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => isInCompare(jewelry._id, 'jewelry') ? removeFromCompare(jewelry._id, 'jewelry') : addToCompare(jewelry, 'jewelry')}
                   className={isInCompare(jewelry._id, 'jewelry') ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
                 >
                   {isInCompare(jewelry._id, 'jewelry') ? "Remove from Compare" : "Add to Compare"}
                 </Button>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">{jewelry.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block mb-1 text-xs uppercase tracking-wider">Metal</span>
                  <span className="font-medium text-lg">{jewelry.metal}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block mb-1 text-xs uppercase tracking-wider">Gemstone</span>
                  <span className="font-medium text-lg">{jewelry.gemstone || "None"}</span>
                </div>
                {/* Dynamic Specs */}
                {jewelry.specifications && Object.entries(jewelry.specifications).map(([key, val]) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-100 capitalize">
                    <span className="text-gray-500 block mb-1 text-xs uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium text-lg">{val}</span>
                  </div>
                ))}
              </div>

              {/* Certifications Section */}
              {jewelry.certificationFiles && jewelry.certificationFiles.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3">Certifications & Documents</h3>
                      <div className="flex flex-col gap-2">
                          {jewelry.certificationFiles.map((cert, idx) => (
                              <a 
                                  key={idx} 
                                  href={`${import.meta.env.VITE_BACKEND_URL}${cert.url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 hover:underline bg-white p-2 rounded border border-blue-100"
                              >
                                  <FileIcon className="w-4 h-4" />
                                  {cert.originalName || `Certification ${idx + 1}`}
                              </a>
                          ))}
                      </div>
                  </div>
              )}
            </div>

            {/* Customization Section */}
            <div className="border-t pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="font-serif text-2xl text-navy-900">Customize this Piece</h3>
                <div className="flex items-center gap-2">
                   <span className={`text-sm ${!isCustomizing ? 'font-bold text-navy-900' : 'text-gray-500'}`}>Standard</span>
                   <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className={isCustomizing ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
                   >
                     {isCustomizing ? "Switch to Standard" : "Enable Customization"}
                   </Button>
                   <span className={`text-sm ${isCustomizing ? 'font-bold text-blue-700' : 'text-gray-500'}`}>Custom Design</span>
                </div>
              </div>
              
              {isCustomizing ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-4">
                    <h4 className="font-medium text-blue-900">1. Select Diamonds</h4>
                    <p className="text-sm text-blue-700/80">Choose one or more diamonds to add to your design.</p>
                    
                    <div className="space-y-3">
                       {selectedDiamonds.map((d, idx) => (
                         <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border shadow-sm">
                            <div className="flex items-center gap-3">
                              <img src={`${import.meta.env.VITE_BACKEND_URL}${d.imageUrl}`} className="w-10 h-10 rounded object-cover" alt="" />
                              <div>
                                <p className="text-sm font-bold">{d.carat}ct {d.shape}</p>
                                <p className="text-xs text-gray-500">${d.price.toLocaleString()}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0" onClick={() => handleRemoveDiamond(idx)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </Button>
                         </div>
                       ))}
                       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50">
                            + Add Diamond
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Select a Diamond</DialogTitle>
                          </DialogHeader>
                          <DiamondSelector onSelect={handleDiamondSelect} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">2. Customization Details</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Instructions</label>
                      <textarea 
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                        placeholder="Describe how you want the diamonds arranged, any specific design changes, or questions..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                      <div className="space-y-2">
                        {attachments.length > 0 && (
                            <div className="space-y-1 bg-gray-50 p-2 rounded border">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                        <button onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="relative">
                            <Button variant="outline" className="w-full border-dashed" onClick={() => document.getElementById('jewelry-inquiry-upload').click()}>
                                + Add Images or Videos
                            </Button>
                            <input 
                                id="jewelry-inquiry-upload"
                                type="file" 
                                multiple
                                accept="image/*,video/*,application/pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">3. Your Contact Info</h4>
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

                  <Button 
                    className="w-full h-14 text-lg bg-navy-900 hover:bg-navy-800 text-white"
                    onClick={handleSubmitInquiry}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Custom Inquiry"}
                  </Button>
                </div>
              ) : (
                // Standard View
                <>
                  {!selectedDiamonds.length ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center space-y-4 hover:shadow-md transition-shadow">
                       <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button className="flex-1 h-14 text-lg text-white font-medium shadow-lg hover:shadow-xl transition-all bg-navy-900 hover:bg-navy-800">
                      Add to Cart - ${totalPrice.toLocaleString()}
                    </Button>
                    <Button variant="outline" className="h-14 px-8 text-lg border-2 hover:bg-gray-50">
                      Book Appointment
                    </Button>
                  </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex justify-between items-center shadow-sm">
                      <div className="flex gap-4 items-center">
                        <img 
                          src={`${import.meta.env.VITE_BACKEND_URL}${selectedDiamonds[0].imageUrl}`} 
                          alt="Diamond" 
                          className="h-16 w-16 rounded-lg object-cover border border-green-200"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JewelryDetail;
