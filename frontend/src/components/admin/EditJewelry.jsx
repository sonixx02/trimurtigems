import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import MultiFileUploader from "./MultiFileUploader";

const EditJewelry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [newVideoFiles, setNewVideoFiles] = useState([]);
  const [newCertFiles, setNewCertFiles] = useState([]);

  const [existingFiles, setExistingFiles] = useState({
    images: [],
    videos: [],
    certificationFiles: [],
    threeDModelUrl: null
  });
  
  const selectedCategory = watch("category");

  useEffect(() => {
    const fetchJewelry = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jewelry/${id}`);
        const item = res.data.jewelry;
        
        // Pre-fill common fields
        setValue("name", item.name);
        setValue("stockNumber", item.stockNumber);
        setValue("category", item.category);
        setValue("price", item.price);
        setValue("description", item.description);
        setValue("metal", item.metal);
        setValue("gemstone", item.gemstone);
        setValue("stockStatus", item.stockStatus || "In Stock");
        setValue("stockQuantity", item.stockQuantity || 1);
        setValue("showStockQuantity", item.showStockQuantity || false);
        
        // Pre-fill dynamic specifications
        if (item.specifications) {
          Object.keys(item.specifications).forEach(key => {
            setValue(key, item.specifications[key]);
          });
        }
        
        // Set existing files
        setExistingFiles({
          images: item.images || [],
          videos: item.videos || [],
          certificationFiles: item.certificationFiles || [],
          threeDModelUrl: item.threeDModelUrl
        });
        
        setFetching(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch jewelry details");
        navigate('/admin/manage-jewelry');
      }
    };
    fetchJewelry();
  }, [id, setValue, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // 1. Update Jewelry Item
      const jewelryData = {
        name: data.name,
        stockNumber: data.stockNumber,
        category: data.category,
        price: parseFloat(data.price),
        description: data.description,
        metal: data.metal,
        gemstone: data.gemstone,
        stockStatus: data.stockStatus,
        stockQuantity: data.stockQuantity ? parseInt(data.stockQuantity) : 1,
        showStockQuantity: data.showStockQuantity,
        specifications: {}
      };

      // Add dynamic specifications based on category
      if (data.category === "Ring") {
        jewelryData.specifications.ringSize = data.ringSize;
        jewelryData.specifications.ringStyle = data.ringStyle;
      } else if (data.category === "Necklace") {
        jewelryData.specifications.chainLength = data.chainLength;
        jewelryData.specifications.claspType = data.claspType;
      } else if (data.category === "Earrings") {
        jewelryData.specifications.backingType = data.backingType;
      } else if (data.category === "Bracelet") {
        jewelryData.specifications.length = data.braceletLength;
        jewelryData.specifications.type = data.braceletType;
      }

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/jewelry/update/${id}`, jewelryData);

      // 2. Upload Files (if any)
      if (data.images?.length > 0 || newVideoFiles.length > 0 || newCertFiles.length > 0 || data.threeDModel?.length > 0) {
        const formData = new FormData();
        formData.append('jewelryId', id);
        
        if (data.images) {
          Array.from(data.images).forEach(file => formData.append('images', file));
        }

        if (newVideoFiles.length > 0) {
          newVideoFiles.forEach(file => formData.append('videos', file));
        }

        if (newCertFiles.length > 0) {
          newCertFiles.forEach(file => formData.append('certificationFiles', file));
        }
        
        if (data.threeDModel?.[0]) {
          formData.append('threeDModel', data.threeDModel[0]);
        }

        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jewelry/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success("Jewelry item updated successfully!");
      navigate('/admin/manage-jewelry');
    } catch (error) {
      console.error(error);
      toast.error("Failed to update jewelry item");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Jewelry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Common Fields */}
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input {...register("name", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label>Stock Number</Label>
                <Input {...register("stockNumber", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={watch("category")} onValueChange={(val) => setValue("category", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Ring", "Necklace", "Earrings", "Bracelet", "Pendant", "Other"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" {...register("price", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label>Metal</Label>
                <Select value={watch("metal")} onValueChange={(val) => setValue("metal", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Metal" />
                  </SelectTrigger>
                  <SelectContent>
                    {["18k White Gold", "18k Yellow Gold", "18k Rose Gold", "Platinum", "Silver"].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gemstone (Main)</Label>
                <Input {...register("gemstone")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} />
            </div>

            {/* Dynamic Fields based on Category */}
            {selectedCategory === "Ring" && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                <h3 className="font-medium text-blue-800">Ring Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ring Size</Label>
                    <Input {...register("ringSize")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ring Style</Label>
                    <Select value={watch("ringStyle")} onValueChange={(val) => setValue("ringStyle", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Style" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Solitaire", "Halo", "Three Stone", "Vintage", "Pave"].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === "Necklace" && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                <h3 className="font-medium text-blue-800">Necklace Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Chain Length (inches)</Label>
                    <Input {...register("chainLength")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Clasp Type</Label>
                    <Input {...register("claspType")} />
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === "Bracelet" && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                <h3 className="font-medium text-blue-800">Bracelet Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Length (inches)</Label>
                    <Input {...register("braceletLength")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={watch("braceletType")} onValueChange={(val) => setValue("braceletType", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Tennis", "Bangle", "Chain", "Charm"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Inventory & Stock</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <Select value={watch("stockStatus")} onValueChange={(val) => setValue("stockStatus", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {["In Stock", "Out of Stock", "Call for Availability"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stock Quantity</Label>
                  <Input type="number" {...register("stockQuantity")} min={0} />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input 
                    type="checkbox" 
                    id="showStock" 
                    className="h-4 w-4 rounded border-gray-300 text-navy-900 focus:ring-navy-900"
                    {...register("showStockQuantity")} 
                  />
                  <Label htmlFor="showStock" className="cursor-pointer">Show Quantity to User</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Update Media (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Add New Images</Label>
                  {existingFiles.images.length > 0 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                      {existingFiles.images.map((img, idx) => (
                        <div key={idx} className="relative flex-shrink-0">
                          <img 
                            src={`${import.meta.env.VITE_BACKEND_URL}${img}`} 
                            alt={`Current ${idx}`} 
                            className="h-20 w-20 object-cover rounded-md border"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <Input type="file" accept="image/*" multiple {...register("images")} />
                  <p className="text-xs text-muted-foreground">New images will be added to the existing gallery.</p>
                </div>

                <div className="space-y-2">
                  <Label>Add Videos</Label>
                  {existingFiles.videos && existingFiles.videos.length > 0 && (
                     <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        {existingFiles.videos.map((vid, idx) => (
                          <video key={idx} src={`${import.meta.env.VITE_BACKEND_URL}${vid}`} className="h-16 w-24 object-cover rounded border" controls />
                        ))}
                     </div>
                  )}
                  <MultiFileUploader 
                    label=""
                    accept="video/mp4,video/quicktime,video/webm"
                    files={newVideoFiles}
                    onFilesChange={setNewVideoFiles}
                    helperText="Upload multiple product videos."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Add Certification Files</Label>
                  {existingFiles.certificationFiles && existingFiles.certificationFiles.length > 0 && (
                     <div className="flex flex-col gap-1 mb-2">
                        {existingFiles.certificationFiles.map((cert, idx) => (
                          <a key={idx} href={`${import.meta.env.VITE_BACKEND_URL}${cert.url}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {cert.originalName || `Certification ${idx + 1}`}
                          </a>
                        ))}
                     </div>
                  )}
                  <MultiFileUploader 
                    label=""
                    accept="application/pdf"
                    files={newCertFiles}
                    onFilesChange={setNewCertFiles}
                    helperText="Upload certifications."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Update 3D Model (.glb)</Label>
                  {existingFiles.threeDModelUrl && (
                    <div className="mb-2">
                      <a 
                        href={`${import.meta.env.VITE_BACKEND_URL}${existingFiles.threeDModelUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Download Current Model
                      </a>
                    </div>
                  )}
                  <Input type="file" accept=".glb" {...register("threeDModel")} />
                </div>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/manage-jewelry')}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Updating..." : "Update Jewelry Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditJewelry;
