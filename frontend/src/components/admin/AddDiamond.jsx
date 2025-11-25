import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import MultiFileUploader from "./MultiFileUploader";

const AddDiamond = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [videoFiles, setVideoFiles] = useState([]);
  const [certFiles, setCertFiles] = useState([]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // 1. Create Diamond Record
      const createRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds/create`, {
        stockNumber: data.stockNumber,
        type: data.type || "Natural",
        shape: data.shape,
        cut: data.cut,
        color: data.color,
        clarity: data.clarity,
        carat: parseFloat(data.carat),
        price: parseFloat(data.price),
        fluorescence: data.fluorescence,
        polish: data.polish,
        symmetry: data.symmetry,
        table: parseFloat(data.table),
        depth: parseFloat(data.depth),
        lengthWidthRatio: parseFloat(data.lengthWidthRatio),
        certification: data.certification,
        shipment: data.shipment,
        stockStatus: data.stockStatus || "In Stock",
        stockQuantity: data.stockQuantity ? parseInt(data.stockQuantity) : 1,
        showStockQuantity: data.showStockQuantity || false
      });

      const diamondId = createRes.data.diamond._id;

      // 2. Upload Files
      if (data.normalImage?.[0] || data.pdfFile?.[0] || data.threeDModel?.[0] || (data.images && data.images.length > 0) || videoFiles.length > 0 || certFiles.length > 0) {
        const formData = new FormData();
        formData.append('diamondId', diamondId);
        
        if (data.normalImage?.[0]) {
          formData.append('normalImage', data.normalImage[0]);
        }

        if (data.images) {
          Array.from(data.images).forEach(file => formData.append('images', file));
        }

        if (videoFiles.length > 0) {
          videoFiles.forEach(file => formData.append('videos', file));
        }

        if (certFiles.length > 0) {
          certFiles.forEach(file => formData.append('certificationFiles', file));
        }

        if (data.pdfFile?.[0]) {
          formData.append('pdfFile', data.pdfFile[0]);
        }
        
        if (data.threeDModel?.[0]) {
          formData.append('threeDModel', data.threeDModel[0]);
        }

        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds/upload/${diamondId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success("Diamond added successfully!");
      reset();
      setVideoFiles([]);
      setCertFiles([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add diamond. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Diamond</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Stock Number</Label>
                <Input {...register("stockNumber", { required: true })} placeholder="e.g. DIA-123" />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select onValueChange={(value) => setValue("type", value)} defaultValue="Natural">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Natural">Natural</SelectItem>
                    <SelectItem value="Lab Grown">Lab Grown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Shape</Label>
                <Select onValueChange={(val) => setValue("shape", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Shape" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Round", "Princess", "Emerald", "Cushion", "Oval", "Pear", "Heart", "Radiant", "Marquise", "Asscher"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Carat</Label>
                <Input type="number" step="0.01" {...register("carat", { required: true })} placeholder="1.00" />
              </div>

              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" {...register("price", { required: true })} placeholder="5000" />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select onValueChange={(val) => setValue("color", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Clarity</Label>
                <Select onValueChange={(val) => setValue("clarity", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Clarity" />
                  </SelectTrigger>
                  <SelectContent>
                    {["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cut</Label>
                <Select onValueChange={(val) => setValue("cut", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Cut" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Good", "Very Good", "Ideal", "Astor Ideal"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fluorescence</Label>
                <Select onValueChange={(val) => setValue("fluorescence", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Fluorescence" />
                  </SelectTrigger>
                  <SelectContent>
                    {["None", "Faint", "Medium", "Strong", "Very Strong"].map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Polish</Label>
                <Select onValueChange={(val) => setValue("polish", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Polish" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Excellent", "Very Good", "Good", "Fair", "Poor"].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Symmetry</Label>
                <Select onValueChange={(val) => setValue("symmetry", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Symmetry" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Excellent", "Very Good", "Good", "Fair", "Poor"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Table %</Label>
                <Input type="number" step="0.1" {...register("table")} placeholder="58.0" />
              </div>

              <div className="space-y-2">
                <Label>Depth %</Label>
                <Input type="number" step="0.1" {...register("depth")} placeholder="61.5" />
              </div>

              <div className="space-y-2">
                <Label>L/W Ratio</Label>
                <Input type="number" step="0.01" {...register("lengthWidthRatio")} placeholder="1.5" />
              </div>

              <div className="space-y-2">
                <Label>Certification</Label>
                <Select onValueChange={(val) => setValue("certification", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Certification" />
                  </SelectTrigger>
                  <SelectContent>
                    {["GIA", "IGI", "AGS", "HRD"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Shipment</Label>
                <Select onValueChange={(val) => setValue("shipment", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Shipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Standard", "Overnight", "Express"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
              <h3 className="font-medium">Media Uploads</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Main Diamond Image (Thumbnail)</Label>
                  <Input type="file" accept="image/*" {...register("normalImage")} />
                </div>

                <div className="space-y-2">
                  <Label>Additional Images (Gallery)</Label>
                  <Input type="file" accept="image/*" multiple {...register("images")} />
                  <p className="text-xs text-gray-500">Select multiple images for the carousel.</p>
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
                  <Label>GIA Report (PDF) - Legacy</Label>
                  <Input type="file" accept="application/pdf" {...register("pdfFile")} />
                  <p className="text-xs text-gray-500">For backward compatibility.</p>
                </div>

                <div className="space-y-2">
                  <Label>3D Model (.glb)</Label>
                  <Input type="file" accept=".glb" {...register("threeDModel")} />
                </div>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Adding..." : "Add Diamond"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDiamond;
