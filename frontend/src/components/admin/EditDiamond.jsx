import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import MultiFileUploader from "./MultiFileUploader";

const EditDiamond = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [newVideoFiles, setNewVideoFiles] = useState([]);
  const [newCertFiles, setNewCertFiles] = useState([]);

  const [existingFiles, setExistingFiles] = useState({
    imageUrl: null,
    images: [],
    videos: [],
    certificationFiles: [],
    giaReport: null,
    threeDModelUrl: null
  });

  useEffect(() => {
    const fetchDiamond = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds/id/${id}`);
        const diamond = res.data.diamond;
        
        // Pre-fill form
        setValue("stockNumber", diamond.stockNumber);
        setValue("type", diamond.type || "Natural");
        setValue("shape", diamond.shape);
        setValue("cut", diamond.cut);
        setValue("color", diamond.color);
        setValue("clarity", diamond.clarity);
        setValue("carat", diamond.carat);
        setValue("price", diamond.price);
        setValue("fluorescence", diamond.fluorescence);
        setValue("polish", diamond.polish);
        setValue("symmetry", diamond.symmetry);
        setValue("table", diamond.table);
        setValue("depth", diamond.depth);
        setValue("lengthWidthRatio", diamond.lengthWidthRatio);
        setValue("certification", diamond.certification);
        setValue("shipment", diamond.shipment);
        setValue("stockStatus", diamond.stockStatus || "In Stock");
        setValue("stockQuantity", diamond.stockQuantity || 1);
        setValue("showStockQuantity", diamond.showStockQuantity || false);
        
        // Set existing files
        setExistingFiles({
          imageUrl: diamond.imageUrl,
          images: diamond.images || [],
          videos: diamond.videos || [],
          certificationFiles: diamond.certificationFiles || [],
          giaReport: diamond.giaReport,
          threeDModelUrl: diamond.threeDModelUrl
        });
        
        setFetching(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch diamond details");
        navigate('/admin/manage');
      }
    };
    fetchDiamond();
  }, [id, setValue, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds/update/${id}`, {
        stockNumber: data.stockNumber,
        type: data.type,
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
        stockStatus: data.stockStatus,
        stockQuantity: data.stockQuantity ? parseInt(data.stockQuantity) : 1,
        showStockQuantity: data.showStockQuantity
      });

      // Handle file uploads if any new files are selected
      if (data.normalImage?.[0] || data.pdfFile?.[0] || data.threeDModel?.[0] || (data.images && data.images.length > 0) || newVideoFiles.length > 0 || newCertFiles.length > 0) {
        const formData = new FormData();
        formData.append('diamondId', id);
        if (data.normalImage?.[0]) formData.append('normalImage', data.normalImage[0]);
        if (data.pdfFile?.[0]) formData.append('pdfFile', data.pdfFile[0]);
        if (data.threeDModel?.[0]) formData.append('threeDModel', data.threeDModel[0]);
        
        if (data.images && data.images.length > 0) {
          Array.from(data.images).forEach((file) => {
            formData.append('images', file);
          });
        }

        if (newVideoFiles.length > 0) {
          newVideoFiles.forEach((file) => {
            formData.append('videos', file);
          });
        }

        if (newCertFiles.length > 0) {
          newCertFiles.forEach((file) => {
            formData.append('certificationFiles', file);
          });
        }

        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds/upload/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success("Diamond updated successfully!");
      navigate('/admin/manage');
    } catch (error) {
      console.error(error);
      toast.error("Failed to update diamond");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Diamond</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Stock Number</Label>
                <Input {...register("stockNumber", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  onValueChange={(value) => setValue("type", value)} 
                  value={watch("type") || "Natural"}
                >
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
                <Select value={watch("shape")} onValueChange={(val) => setValue("shape", val)}>
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
                <Input type="number" step="0.01" {...register("carat", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" {...register("price", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={watch("color")} onValueChange={(val) => setValue("color", val)}>
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
                <Select value={watch("clarity")} onValueChange={(val) => setValue("clarity", val)}>
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
                <Select value={watch("cut")} onValueChange={(val) => setValue("cut", val)}>
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
                <Select value={watch("fluorescence")} onValueChange={(val) => setValue("fluorescence", val)}>
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
                <Select value={watch("polish")} onValueChange={(val) => setValue("polish", val)}>
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
                <Select value={watch("symmetry")} onValueChange={(val) => setValue("symmetry", val)}>
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
                <Input type="number" step="0.1" {...register("table")} />
              </div>

              <div className="space-y-2">
                <Label>Depth %</Label>
                <Input type="number" step="0.1" {...register("depth")} />
              </div>

              <div className="space-y-2">
                <Label>L/W Ratio</Label>
                <Input type="number" step="0.01" {...register("lengthWidthRatio")} />
              </div>

              <div className="space-y-2">
                <Label>Certification</Label>
                <Select value={watch("certification")} onValueChange={(val) => setValue("certification", val)}>
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
                <Select value={watch("shipment")} onValueChange={(val) => setValue("shipment", val)}>
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
                  <Label>Diamond Image</Label>
                  {existingFiles.imageUrl && (
                    <div className="mb-2">
                      <img 
                        src={`${import.meta.env.VITE_BACKEND_URL}${existingFiles.imageUrl}`} 
                        alt="Current" 
                        className="h-32 w-32 object-cover rounded-md border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Current Image</p>
                    </div>
                  )}
                  <Input type="file" accept="image/*" {...register("normalImage")} />
                </div>

                <div className="space-y-2">
                  <Label>Additional Images</Label>
                  {existingFiles.images && existingFiles.images.length > 0 && (
                     <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        {existingFiles.images.map((img, idx) => (
                          <img key={idx} src={`${import.meta.env.VITE_BACKEND_URL}${img}`} className="h-16 w-16 object-cover rounded border" alt="" />
                        ))}
                     </div>
                  )}
                  <Input type="file" accept="image/*" multiple {...register("images")} />
                  <p className="text-xs text-gray-500">Uploading new images will add to existing ones.</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Videos</Label>
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
                  <Label>Certification Files (PDFs)</Label>
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
                    helperText="Upload GIA, IGI, AGS, HRD or other certifications."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>GIA Report (PDF) - Legacy</Label>
                  {existingFiles.giaReport && (
                    <div className="mb-2">
                      <a 
                        href={`${import.meta.env.VITE_BACKEND_URL}${existingFiles.giaReport}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Current Report
                      </a>
                    </div>
                  )}
                  <Input type="file" accept="application/pdf" {...register("pdfFile")} />
                </div>
                
                <div className="space-y-2">
                  <Label>3D Model (.glb)</Label>
                  {existingFiles.threeDModelUrl && (
                    <div className="mb-2">
                      <a 
                        href={`${import.meta.env.VITE_BACKEND_URL}${existingFiles.threeDModelUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Current Model
                      </a>
                    </div>
                  )}
                  <Input type="file" accept=".glb" {...register("threeDModel")} />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating Diamond..." : "Update Diamond"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditDiamond;
