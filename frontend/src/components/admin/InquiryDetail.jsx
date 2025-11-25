import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Canvas } from "@react-three/fiber";
import { Stage, PresentationControls, useGLTF } from "@react-three/drei";

const ModelViewer = ({ url }) => {
  const { scene } = useGLTF(`${import.meta.env.VITE_BACKEND_URL}${url}`);
  return <primitive object={scene} />;
};

const InquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    console.log("Fetching inquiry details for ID:", id);
    try {
      // 1. Fetch Inquiry
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/inquiries/${id}`);
      const inquiryData = res.data;
      console.log("Inquiry data fetched:", inquiryData);
      setInquiry(inquiryData);

      // 2. Fetch Product Details if applicable
      if (inquiryData.baseItemId) {
        // Try fetching as Jewelry first
        try {
          const prodRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jewelry/${inquiryData.baseItemId}`);
          setProduct({ ...prodRes.data.jewelry, type: 'Jewelry' });
        } catch (err) {
          // If not found, try Diamond
          try {
            const diaRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds/id/${inquiryData.baseItemId}`);
            setProduct({ ...diaRes.data.diamond, type: 'Diamond' });
          } catch (err2) {
            console.error("Product not found in Jewelry or Diamond collections");
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

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!inquiry) return <div className="p-8 text-center">Inquiry not found</div>;

  // Combine attachments and legacy reference images
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
                          <span>{d.carat}ct {d.shape} {d.color}/{d.clarity}</span>
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
                          <svg className="w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
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
                {/* 3D Model or Main Image */}
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                  {product.threeDModelUrl ? (
                    <Canvas dpr={[1, 2]} shadows camera={{ fov: 45 }} style={{ position: "absolute" }}>
                      <color attach="background" args={["#f3f4f6"]} />
                      <PresentationControls speed={1.5} global zoom={0.5} polar={[-0.1, Math.PI / 4]}>
                        <Stage environment="city">
                          <ModelViewer url={product.threeDModelUrl} />
                        </Stage>
                      </PresentationControls>
                    </Canvas>
                  ) : (
                    <img 
                      src={product.imageUrl || (product.images && product.images[0]) || "/placeholder.png"} 
                      className="w-full h-full object-cover"
                      alt="Product"
                    />
                  )}
                </div>

                {/* Product Specs */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Price</span>
                    <span className="font-semibold text-lg">${product.price?.toLocaleString()}</span>
                  </div>
                  {product.stockNumber && (
                    <div>
                      <span className="text-gray-500 block">Stock Number</span>
                      <span className="font-medium">{product.stockNumber}</span>
                    </div>
                  )}
                  {product.metal && (
                    <div>
                      <span className="text-gray-500 block">Metal</span>
                      <span className="font-medium">{product.metal}</span>
                    </div>
                  )}
                  {product.gemstone && (
                    <div>
                      <span className="text-gray-500 block">Gemstone</span>
                      <span className="font-medium">{product.gemstone}</span>
                    </div>
                  )}
                  {product.shape && (
                    <div>
                      <span className="text-gray-500 block">Shape</span>
                      <span className="font-medium">{product.shape}</span>
                    </div>
                  )}
                  {product.carat && (
                    <div>
                      <span className="text-gray-500 block">Carat</span>
                      <span className="font-medium">{product.carat}</span>
                    </div>
                  )}
                </div>

                {product.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
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
