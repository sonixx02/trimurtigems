import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Grid,
  Html,
  MeshRefractionMaterial,
  Caustics
} from "@react-three/drei";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ChevronLeft, FileText, X, ChevronRight, Play, Pause, FileIcon, Trash2, Heart } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import { useCompare } from "../hooks/useCompare";
import { useAuth } from "../context/AuthContext";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D View Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-100 text-gray-500 flex-col gap-2">
          <p>Unable to load 3D View</p>
          <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false })}>Retry</Button>
        </div>
      );
    }

    return this.props.children; 
  }
}

// Scene setup component to handle lighting and environment
const SceneSetup = ({ children }) => {
  return (
    <>
      <color attach="background" args={["#f0f0f0"]} />
      <ambientLight intensity={0.5} />

      {/* Primary diamond light */}
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill light */}
      <pointLight position={[-5, 3, -5]} intensity={1.5} />

      <Grid
        position={[0, -1, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#D0D0D0"
        fadeDistance={30}
      />

      {children}
    </>
  );
};

const DiamondModel = ({ modelPath, materialProps, onColorChange }) => {
  const { shape } = useParams();
  const { scene: originalScene } = useGLTF(modelPath);
  const modelRef = useRef();
  const [model, setModel] = useState(null);

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
    if (originalScene) {
      // Clone the scene to avoid mutating the original
      const clonedScene = originalScene.clone();
      let selectedModel = null;

      // Find the specific model by name
      const targetName = shapeToModelName[shape.toLowerCase()];

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
        console.error(`No diamond model found for shape: ${shape}`);
      }
    }
  }, [originalScene, shape]);

  if (!model) return null;

  return (
    <group ref={modelRef} scale={1.5}>
      {" "}
      {/* Scale up the diamond */}
      <Caustics
        backfaces
        color={materialProps.color}
        position={[0, -0.5, 0]}
        lightSource={[5, 5, 5]}
        worldRadius={0.1}
        ior={materialProps.ior}
        intensity={0.2}
      >
        <mesh castShadow geometry={model.geometry}>
          <MeshRefractionMaterial
            envMap={texture}
            bounces={materialProps.bounces}
            aberrationStrength={materialProps.aberrationStrength}
            ior={materialProps.ior}
            fresnel={materialProps.fresnel}
            color={materialProps.color}
            transmission={materialProps.transmission}
            toneMapped={false}
            fastChroma
          />
        </mesh>
      </Caustics>
      <Html
        position={[0.25, 0.1, 2.75]}
        scale={0.15}
        rotation={[Math.PI / 2, 0, 0]}
        transform
      >
      </Html>
    </group>
  );
};

const ImageGallery = ({ images, onImageClick }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        No Images Available
      </div>
    );
  }

  return (
    <div className="relative h-full group">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((img, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-full" key={index}>
              <img 
                src={`${import.meta.env.VITE_BACKEND_URL}${img}`} 
                alt={`View ${index + 1}`} 
                className="w-full h-full object-contain cursor-zoom-in"
                onClick={() => onImageClick(index)}
              />
            </div>
          ))}
        </div>
      </div>
      
      {images.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => emblaApi && emblaApi.scrollPrev()}
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => emblaApi && emblaApi.scrollNext()}
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === 0 ? "bg-navy-900" : "bg-gray-300" 
                }`}
                onClick={() => emblaApi && emblaApi.scrollTo(idx)}
              />
            ))}
          </div>
        </>
      )}
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

  const togglePlay = (index, videoRef) => {
    if (playing === index) {
      videoRef.pause();
      setPlaying(null);
    } else {
      // Pause all others (simplified for now, assuming one active)
      videoRef.play();
      setPlaying(index);
    }
  };

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
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <button 
        onClick={prevImage}
        className="absolute left-4 text-white hover:text-gray-300 transition-colors"
      >
        <ChevronLeft className="w-10 h-10" />
      </button>

      <img 
        src={`${import.meta.env.VITE_BACKEND_URL}${images[currentIndex]}`} 
        alt="Full screen view" 
        className="max-h-[90vh] max-w-[90vw] object-contain"
      />

      <button 
        onClick={nextImage}
        className="absolute right-4 text-white hover:text-gray-300 transition-colors"
      >
        <ChevronRight className="w-10 h-10" />
      </button>

      <div className="absolute bottom-4 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

const StockDisplay = ({ status, quantity, showQuantity }) => {
  const getStatusColor = () => {
    switch (status) {
      case "In Stock": return "text-green-600 bg-green-50 border-green-200";
      case "Out of Stock": return "text-red-600 bg-red-50 border-red-200";
      case "Call for Availability": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()}`}>
      <span className={`w-2 h-2 rounded-full ${
        status === "In Stock" ? "bg-green-600" : 
        status === "Out of Stock" ? "bg-red-600" : "bg-orange-600"
      }`}></span>
      {status}
      {status === "In Stock" && showQuantity && quantity > 0 && (
        <span className="ml-1 text-xs opacity-75">({quantity} available)</span>
      )}
    </div>
  );
};

const DiamondView = () => {
  const { shape, id } = useParams();
  const navigate = useNavigate();
  const [diamond, setDiamond] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("image"); // "image", "3d", "video"
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [materialProps, setMaterialProps] = useState({
    bounces: 3,
    aberrationStrength: 0.01,
    ior: 2.42,
    fresnel: 1,
    color: "#ffffff",
    transmission: 0.9,
  });

  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: "", email: "", phone: "", message: "", attachments: [] });
  const [submitting, setSubmitting] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { user, toggleFavorite } = useAuth();
  
  const isFavorite = user?.favorites?.some(f => f.itemId === diamond?._id);

  const handleBack = () => {
    navigate(`/diamonds/${shape}`);
  };

  const getModelPath = () => {
     if (diamond?.threeDModelUrl) return `${import.meta.env.VITE_BACKEND_URL}${diamond.threeDModelUrl}`;
     return `${import.meta.env.BASE_URL}images/GemstoneAssets.glb`; 
  };

  const handleColorChange = (color) => {
    setMaterialProps(prev => ({ ...prev, color }));
  };

  const resetCamera = () => {
    setAutoRotate(true);
  };

  const handleInquirySubmit = async () => {
    // Check if user is logged in, if not, prompt them to login
    if (!user) {
      toast.error("Please login or register to submit an inquiry");
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (!inquiryForm.message) {
      toast.error("Please add a message");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", "Single Item");
      formData.append("baseItemId", diamond._id);
      formData.append("baseItemName", `${diamond.carat}ct ${diamond.shape} Diamond`);
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", inquiryForm.phone || "");
      formData.append("customNotes", inquiryForm.message);
      formData.append("userId", user._id);

      if (inquiryForm.attachments && inquiryForm.attachments.length > 0) {
        Array.from(inquiryForm.attachments).forEach(file => {
            formData.append("attachments", file);
        });
      }

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/inquiries/create`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Inquiry sent!");
      setIsInquiryOpen(false);
      setInquiryForm({ name: "", email: "", phone: "", message: "", attachments: [] });
    } catch (e) {
      console.error(e);
      toast.error("Failed to send inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
        // Convert FileList to Array and append to existing
        const newFiles = Array.from(e.target.files);
        setInquiryForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newFiles]
        }));
    }
  };

  const removeAttachment = (index) => {
      setInquiryForm(prev => ({
          ...prev,
          attachments: prev.attachments.filter((_, i) => i !== index)
      }));
  };

  useEffect(() => {
    const fetchDiamond = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds/${shape}/${id}`);
        setDiamond(res.data.diamond);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("Failed to load diamond details");
        setLoading(false);
      }
    };
    if (id) fetchDiamond();
  }, [shape, id]);

  // Prepare images array
  const displayImages = diamond ? [
    ...(diamond.imageUrl ? [diamond.imageUrl] : []),
    ...(diamond.images || [])
  ] : [];
  
  const uniqueImages = [...new Set(displayImages)];

  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!diamond) return <div className="p-8 text-center">No diamond details found.</div>;

  const isPurchasable = diamond.stockStatus !== "Out of Stock";

  return (
    <div className="min-h-screen bg-white pb-20">
      {lightboxOpen && (
        <Lightbox 
          images={uniqueImages} 
          initialIndex={lightboxIndex} 
          onClose={() => setLightboxOpen(false)} 
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <button
          onClick={handleBack}
          className="text-gray-500 hover:text-navy-900 mb-8 flex items-center text-sm font-medium transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back To Search
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left side - Visuals */}
          <div className="lg:w-3/5 h-[600px] bg-gray-50 rounded-2xl overflow-hidden relative shadow-inner border border-gray-100">
             <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                    viewMode === "3d" ? "bg-navy-900 text-white shadow-lg scale-105" : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setViewMode("3d")}
                >
                  3D VIEW
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                    viewMode === "image" ? "bg-navy-900 text-white shadow-lg scale-105" : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setViewMode("image")}
                >
                  IMAGES
                </button>
                {diamond.videos && diamond.videos.length > 0 && (
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

              <div className="w-full h-full">
                {viewMode === "3d" ? (
                  getModelPath() ? (
                    <ErrorBoundary>
                      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                        <React.Suspense fallback={<Html center>Loading 3D View...</Html>}>
                          <Environment preset="city" />
                          <SceneSetup>
                            <DiamondModel
                              modelPath={getModelPath()}
                              materialProps={materialProps}
                              onColorChange={handleColorChange}
                            />
                          </SceneSetup>
                          <OrbitControls makeDefault autoRotate={autoRotate} autoRotateSpeed={0.5} minDistance={2} maxDistance={8} />
                          <EffectComposer>
                            <Bloom luminanceThreshold={1} intensity={1.5} levels={9} mipmapBlur />
                          </EffectComposer>
                        </React.Suspense>
                      </Canvas>
                    </ErrorBoundary>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 flex-col gap-2">
                      <p>No 3D Model Available</p>
                      <Button variant="outline" size="sm" onClick={() => setViewMode("image")}>View Images</Button>
                    </div>
                  )
                ) : viewMode === "video" ? (
                    <VideoGallery videos={diamond.videos} />
                ) : (
                  <ImageGallery images={uniqueImages} onImageClick={handleImageClick} />
                )}
              </div>

             {viewMode === "3d" && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg flex gap-4 z-10">
                   <button onClick={() => setAutoRotate(!autoRotate)} className="text-xs font-bold text-navy-900 hover:text-blue-600 uppercase transition-colors">
                      {autoRotate ? "Pause" : "Rotate"}
                   </button>
                   <div className="w-px h-4 bg-gray-300"></div>
                   <button onClick={resetCamera} className="text-xs font-bold text-navy-900 hover:text-blue-600 uppercase transition-colors">
                      Reset View
                   </button>
                </div>
             )}
             
             {/* Color Picker Overlay for 3D Mode */}
             {viewMode === "3d" && (
                <div className="absolute top-20 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg z-10 max-w-[200px]">
                   <p className="text-xs font-bold text-gray-500 uppercase mb-2 text-center">Gem Color</p>
                   <HexColorPicker color={materialProps.color} onChange={handleColorChange} style={{ width: '100%', height: '120px' }} />
                </div>
             )}
          </div>

          {/* Right side - Details */}
          <div className="lg:w-2/5 space-y-8">
            <div>
              <div className="flex justify-between items-start">
                 <h1 className="text-3xl font-serif text-navy-900 mb-2">
                   {diamond.carat} Carat {diamond.shape} Diamond
                 </h1>
                 <div className="flex gap-2">
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => toggleFavorite(diamond._id, 'Diamond')}
                       className={isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}
                     >
                       <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
                     </Button>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      diamond.type === 'Lab Grown' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {diamond.type || 'Natural'}
                    </span>
                    {diamond.giaReport && (
                        <a 
                          href={`${import.meta.env.VITE_BACKEND_URL}${diamond.giaReport}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          GIA REPORT
                        </a>
                    )}
                 </div>
              </div>
              <p className="text-gray-500 text-lg">{diamond.certification || "GIA"} Certified • {diamond.cut} Cut</p>
              
              <div className="mt-4">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => isInCompare(diamond._id, 'diamonds') ? removeFromCompare(diamond._id, 'diamonds') : addToCompare(diamond, 'diamonds')}
                   className={isInCompare(diamond._id, 'diamonds') ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
                 >
                   {isInCompare(diamond._id, 'diamonds') ? "Remove from Compare" : "Add to Compare"}
                 </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-b pb-6">
              <div className="flex items-baseline gap-4">
                <p className="text-4xl font-bold text-navy-900">${diamond.price?.toLocaleString()}</p>
              </div>
              <StockDisplay 
                status={diamond.stockStatus} 
                quantity={diamond.stockQuantity} 
                showQuantity={diamond.showStockQuantity} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-navy-200 transition-colors">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Color</p>
                  <p className="font-bold text-lg text-navy-900">{diamond.color}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-navy-200 transition-colors">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Clarity</p>
                  <p className="font-bold text-lg text-navy-900">{diamond.clarity}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-navy-200 transition-colors">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cut</p>
                  <p className="font-bold text-lg text-navy-900">{diamond.cut}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-navy-200 transition-colors">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Carat</p>
                  <p className="font-bold text-lg text-navy-900">{diamond.carat}</p>
               </div>
            </div>

            {/* Detailed Specifications */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
               <h3 className="text-lg font-serif font-bold text-navy-900 mb-4">Specifications</h3>
               <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                     <span className="text-gray-500">Polish</span>
                     <span className="font-medium">{diamond.polish || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                     <span className="text-gray-500">Symmetry</span>
                     <span className="font-medium">{diamond.symmetry || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                     <span className="text-gray-500">Fluorescence</span>
                     <span className="font-medium">{diamond.fluorescence || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                     <span className="text-gray-500">Table %</span>
                     <span className="font-medium">{diamond.table ? `${diamond.table}%` : "-"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                     <span className="text-gray-500">Depth %</span>
                     <span className="font-medium">{diamond.depth ? `${diamond.depth}%` : "-"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                     <span className="text-gray-500">L/W Ratio</span>
                     <span className="font-medium">{diamond.lengthWidthRatio || "-"}</span>
                  </div>
               </div>
            </div>

            {/* Certifications Section */}
            {diamond.certificationFiles && diamond.certificationFiles.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3">Certifications & Documents</h3>
                    <div className="flex flex-col gap-2">
                        {diamond.certificationFiles.map((cert, idx) => (
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

            <div className="space-y-3 pt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="w-full h-14 text-lg bg-navy-900 hover:bg-navy-800 shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isPurchasable}
                  >
                    {isPurchasable ? "Add to Jewelry" : "Currently Unavailable"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={() => navigate(`/jewelry?category=Ring`, { state: { diamond } })}>
                    Add to Ring
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/jewelry?category=Pendant`, { state: { diamond } })}>
                    Add to Pendant
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/jewelry?category=Necklace`, { state: { diamond } })}>
                    Add to Necklace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
               
               <Dialog open={isInquiryOpen} onOpenChange={setIsInquiryOpen}>
                 <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-14 text-lg border-2 hover:bg-gray-50">
                        Inquire About This Diamond
                    </Button>
                 </DialogTrigger>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Inquire about {diamond.carat}ct {diamond.shape} Diamond</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {user ? (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-900">Submitting as: <strong>{user.name}</strong> ({user.email})</p>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-900">Please login or register to submit an inquiry.</p>
                            </div>
                        )}
                        
                        <Input 
                            placeholder="Phone (Optional)" 
                            value={inquiryForm.phone} 
                            onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})} 
                        />
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Attachments</label>
                            <div className="space-y-2">
                                {inquiryForm.attachments.length > 0 && (
                                    <div className="space-y-1 bg-gray-50 p-2 rounded border">
                                        {inquiryForm.attachments.map((file, idx) => (
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
                                    <Button variant="outline" className="w-full border-dashed" onClick={() => document.getElementById('inquiry-file-upload').click()}>
                                        + Add Images or Videos
                                    </Button>
                                    <input 
                                        id="inquiry-file-upload"
                                        type="file" 
                                        multiple 
                                        accept="image/*,video/*,application/pdf"
                                        onChange={handleFileSelect} 
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        <textarea 
                            className="w-full p-3 border rounded-md min-h-[100px]"
                            placeholder="I'm interested in this diamond..."
                            value={inquiryForm.message} 
                            onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})} 
                        />
                        <Button className="w-full bg-navy-900" onClick={handleInquirySubmit} disabled={submitting}>
                            {submitting ? "Sending..." : "Send Inquiry"}
                        </Button>
                    </div>
                 </DialogContent>
               </Dialog>
            </div>

            <div className="text-sm text-gray-500 space-y-2 pt-4 border-t">
               <p className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Free Insured Shipping</p>
               <p className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> 30-Day Returns</p>
               <p className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Lifetime Warranty</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiamondView;
