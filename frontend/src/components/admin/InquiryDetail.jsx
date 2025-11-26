import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Canvas } from "@react-three/fiber";
import { Stage, PresentationControls, useGLTF, Environment, ContactShadows, Html } from "@react-three/drei";
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X, ZoomIn, FileIcon } from "lucide-react";

// --- Reusable Components (Copied/Adapted from JewelryDetail) ---

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

const Model = ({ url, scale = 1, position = [0, 0, 0] }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={scale} position={position} />;
};

const ImageGallery = ({ images, onImageClick }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  if (!images || images.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">No images available</div>;

  return (
    <div className="relative group h-full bg-gray-100 rounded-lg overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((src, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center bg-white" key={index}>
               <img 
                  src={`${import.meta.env.VITE_BACKEND_URL}${src}`} 
                  className="max-h-full max-w-full object-contain cursor-zoom-in" 
                  onClick={() => onImageClick(index)}
                  alt={`View ${index + 1}`}
               />
            </div>
          ))}
        </div>
      </div>
      
      {images.length > 1 && (
        <>
          <button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-5 h-5 text-navy-900" />
          </button>
          <button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5 text-navy-900" />
          </button>
        </>
      )}
    </div>
  );
};

const VideoGallery = ({ videos }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

  if (!videos || videos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        No Videos Available
      </div>
    );
  }

  return (
    <div className="relative h-full group bg-black rounded-lg overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {videos.map((vid, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center" key={index}>
              <video 
                src={`${import.meta.env.VITE_BACKEND_URL}${vid}`} 
                className="max-w-full max-h-full"
                controls
              />
            </div>
          ))}
        </div>
      </div>
      
      {videos.length > 1 && (
        <>
          <button onClick={() => emblaApi && emblaApi.scrollPrev()} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button onClick={() => emblaApi && emblaApi.scrollNext()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
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

// --- Main Component ---

const InquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [viewMode, setViewMode] = useState("image"); // "image", "3d", "video"
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/inquiries/${id}`);
      const inquiryData = res.data;
      setInquiry(inquiryData);

      if (inquiryData.baseItemId) {
        try {
          const prodRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jewelry/${inquiryData.baseItemId}`);
          setProduct({ ...prodRes.data.jewelry, type: 'Jewelry' });
        } catch (err) {
          try {
            const diaRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds/id/${inquiryData.baseItemId}`);
            setProduct({ ...diaRes.data.diamond, type: 'Diamond' });
          } catch (err2) {
            console.error("Product not found");
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      toast.error("Failed to load inquiry details");
      setLoading(false);
    }
  };

  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!inquiry) return <div className="p-8 text-center">Inquiry not found</div>;

  const allAttachments = [
    ...(inquiry.attachments || []),
    ...(inquiry.referenceImageUrls || []).map(url => ({
      url,
      fileType: 'image',
      originalName: 'Reference Image'
    }))
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {lightboxOpen && product && (
        <Lightbox 
          images={product.images || [product.imageUrl]} 
          initialIndex={lightboxIndex} 
          onClose={() => setLightboxOpen(false)} 
        />
      )}

      <Button variant="ghost" onClick={() => navigate('/admin/inquiries')} className="mb-4">
        ← Back to Inquiries
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Inquiry Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{inquiry.contactInfo.name}</CardTitle>
                  <p className="text-gray-500 mt-1">{inquiry.contactInfo.email}</p>
                  <p className="text-gray-500">{inquiry.contactInfo.phone}</p>
                </div>
                <Badge className={inquiry.type === 'Set' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                  {inquiry.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Message / Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                    {inquiry.customNotes || "No message provided."}
                  </div>
                </div>

                {inquiry.selectedDiamonds && inquiry.selectedDiamonds.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Selected Diamonds</h3>
                    <div className="space-y-2">
                      {inquiry.selectedDiamonds.map((d, i) => (
                        <div key={i} className="flex justify-between items-center bg-white border p-3 rounded">
                          <div className="flex items-center gap-3">
                             {d.imageUrl && <img src={`${import.meta.env.VITE_BACKEND_URL}${d.imageUrl}`} className="w-10 h-10 rounded object-cover" alt="" />}
                             <span>{d.carat}ct {d.shape} {d.color}/{d.clarity}</span>
                          </div>
                          <span className="font-mono">${d.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {allAttachments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allAttachments.map((att, idx) => (
                    <div key={idx} className="relative group border rounded-lg overflow-hidden">
                      {att.fileType === 'image' && (
                        <a href={`${import.meta.env.VITE_BACKEND_URL}${att.url}`} target="_blank" rel="noreferrer">
                          <img 
                            src={`${import.meta.env.VITE_BACKEND_URL}${att.url}`} 
                            className="w-full h-32 object-cover hover:scale-105 transition-transform" 
                            alt="Attachment" 
                          />
                        </a>
                      )}
                      {att.fileType === 'video' && (
                        <video controls className="w-full h-32 object-cover">
                          <source src={`${import.meta.env.VITE_BACKEND_URL}${att.url}`} />
                        </video>
                      )}
                      {att.fileType === 'document' && (
                        <a 
                          href={`${import.meta.env.VITE_BACKEND_URL}${att.url}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full h-32 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors p-4"
                        >
                          <FileIcon className="w-8 h-8 text-blue-500 mb-2" />
                          <span className="text-xs text-center font-medium truncate w-full">{att.originalName || 'Document'}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No attachments</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Product Details */}
        <div className="space-y-6">
          {product ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Product Details: {product.name || product.stockNumber}</CardTitle>
                <Badge variant="outline">{product.type}</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Visual Viewer */}
                <div className="h-[400px] bg-gray-50 rounded-xl overflow-hidden border relative shadow-inner">
                   <div className="absolute top-4 left-4 z-10 flex gap-2">
                      {product.threeDModelUrl && (
                        <button
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${viewMode === "3d" ? "bg-navy-900 text-white" : "bg-white text-gray-700"}`}
                          onClick={() => setViewMode("3d")}
                        >
                          3D
                        </button>
                      )}
                      <button
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${viewMode === "image" ? "bg-navy-900 text-white" : "bg-white text-gray-700"}`}
                        onClick={() => setViewMode("image")}
                      >
                        IMG
                      </button>
                      {product.videos && product.videos.length > 0 && (
                        <button
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${viewMode === "video" ? "bg-navy-900 text-white" : "bg-white text-gray-700"}`}
                          onClick={() => setViewMode("video")}
                        >
                          VID
                        </button>
                      )}
                   </div>

                   {viewMode === "3d" && product.threeDModelUrl ? (
                      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 5], fov: 45 }}>
                        <Suspense fallback={<Html center>Loading...</Html>}>
                          <SceneSetup>
                            <Stage environment="city" intensity={0.5} contactShadow={false}>
                              <Model url={`${import.meta.env.VITE_BACKEND_URL}${product.threeDModelUrl}`} />
                            </Stage>
                          </SceneSetup>
                        </Suspense>
                      </Canvas>
                   ) : viewMode === "video" ? (
                      <VideoGallery videos={product.videos} />
                   ) : (
                      <ImageGallery images={product.images || [product.imageUrl]} onImageClick={handleImageClick} />
                   )}
                </div>

                {/* Product Specs */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded border">
                    <span className="text-gray-500 block text-xs uppercase">Price</span>
                    <span className="font-semibold text-lg">${product.price?.toLocaleString()}</span>
                  </div>
                  {product.stockNumber && (
                    <div className="p-3 bg-gray-50 rounded border">
                      <span className="text-gray-500 block text-xs uppercase">Stock #</span>
                      <span className="font-medium">{product.stockNumber}</span>
                    </div>
                  )}
                  {product.metal && (
                    <div className="p-3 bg-gray-50 rounded border">
                      <span className="text-gray-500 block text-xs uppercase">Metal</span>
                      <span className="font-medium">{product.metal}</span>
                    </div>
                  )}
                  {product.gemstone && (
                    <div className="p-3 bg-gray-50 rounded border">
                      <span className="text-gray-500 block text-xs uppercase">Gemstone</span>
                      <span className="font-medium">{product.gemstone}</span>
                    </div>
                  )}
                  {/* Dynamic Specs */}
                  {product.specifications && Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded border capitalize">
                      <span className="text-gray-500 block text-xs uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Certifications */}
                {product.certificationFiles && product.certificationFiles.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Certifications</h3>
                      <div className="flex flex-col gap-2">
                          {product.certificationFiles.map((cert, idx) => (
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

              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center p-6">
                <p className="text-gray-500">Product information not available</p>
                <p className="text-xs text-gray-400 mt-1">Item may have been deleted or ID is missing</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryDetail;
