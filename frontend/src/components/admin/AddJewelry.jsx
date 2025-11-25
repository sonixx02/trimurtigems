import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import MultiFileUploader from "./MultiFileUploader";

const AddJewelry = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [videoFiles, setVideoFiles] = useState([]);
  const [certFiles, setCertFiles] = useState([]);
  
  const selectedCategory = watch("category");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // 1. Create Jewelry Item
      const jewelryData = {
        name: data.name,
        stockNumber: data.stockNumber,
        category: data.category,
        price: parseFloat(data.price),
        description: data.description,
        metal: data.metal,
        gemstone: data.gemstone,
        stockStatus: data.stockStatus || "In Stock",
        stockQuantity: data.stockQuantity ? parseInt(data.stockQuantity) : 1,
        showStockQuantity: data.showStockQuantity || false,
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

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jewelry/create`, jewelryData);
      const jewelryId = res.data.jewelry._id;

      // 2. Upload Files
      if (data.images?.length > 0 || videoFiles.length > 0 || certFiles.length > 0 || data.threeDModel?.length > 0) {
        const formData = new FormData();
        formData.append('jewelryId', jewelryId);
        
        if (data.images) {
          Array.from(data.images).forEach(file => formData.append('images', file));
        }

        if (videoFiles.length > 0) {
          videoFiles.forEach(file => formData.append('videos', file));
        }

        if (certFiles.length > 0) {
          certFiles.forEach(file => formData.append('certificationFiles', file));
        }
        
        if (data.threeDModel?.[0]) {
          formData.append('threeDModel', data.threeDModel[0]);
        }

        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jewelry/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success("Jewelry item added successfully!");
      reset();
      setVideoFiles([]);
      setCertFiles([]);
      navigate('/admin/manage-jewelry');
    } catch (error) {
      console.error(error);
      toast.error("Failed to add jewelry item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Jewelry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Common Fields */}
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input {...register("name", { required: true })} placeholder="e.g. Sapphire Halo Ring" />
              </div>

              <div className="space-y-2">
                <Label>Stock Number</Label>
                <Input {...register("stockNumber", { required: true })} placeholder="e.g. JWL-001" />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={(val) => setValue("category", val)}>
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
                <Select onValueChange={(val) => setValue("metal", val)}>
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
                <Input {...register("gemstone")} placeholder="e.g. Diamond, Sapphire, None" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Detailed description of the item..." />
            </div>

            {/* Dynamic Fields based on Category */}
            {selectedCategory === "Ring" && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                <h3 className="font-medium text-blue-800">Ring Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ring Size</Label>
                    <Input {...register("ringSize")} placeholder="e.g. 6.5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ring Style</Label>
                    <Select onValueChange={(val) => setValue("ringStyle", val)}>
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
                    <Input {...register("chainLength")} placeholder="e.g. 18" />
                  </div>
                  <div className="space-y-2">
                    <Label>Clasp Type</Label>
                    <Input {...register("claspType")} placeholder="e.g. Lobster" />
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
                    <Input {...register("braceletLength")} placeholder="e.g. 7" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select onValueChange={(val) => setValue("braceletType", val)}>
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
                  <Select onValueChange={(val) => setValue("stockStatus", val)} defaultValue="In Stock">
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
                  <Input type="number" {...register("stockQuantity")} defaultValue={1} min={0} />
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
              <h3 className="font-medium">Media</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Images (Gallery)</Label>
                  <Input type="file" accept="image/*" multiple {...register("images")} />
                  <p className="text-xs text-muted-foreground">First image will be the main display image. Select multiple images for gallery.</p>
                </div>

                <div className="space-y-2">
                  <Label>Videos (MP4, MOV, WebM)</Label>
                  <MultiFileUploader 
                    label=""
                    accept="video/mp4,video/quicktime,video/webm"
                    files={videoFiles}
                    onFilesChange={setVideoFiles}
                    helperText="Upload multiple product videos."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Certification Files (PDFs)</Label>
                  <MultiFileUploader 
                    label=""
                    accept="application/pdf"
                    files={certFiles}
                    onFilesChange={setCertFiles}
                    helperText="Upload GIA, IGI, AGS, HRD or other certifications."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>3D Model (.glb)</Label>
                  <Input type="file" accept=".glb" {...register("threeDModel")} />
                </div>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Adding..." : "Add Jewelry Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddJewelry;
