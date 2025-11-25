import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

const MultiFileUploader = ({ label, accept, files, onFilesChange, helperText }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onFilesChange([...files, ...newFiles]);
      // Reset input so the same file can be selected again if needed (though unlikely in this flow)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Hidden Input */}
      <input
        type="file"
        accept={accept}
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {/* File List Display */}
      {files.length > 0 && (
        <div className="space-y-2 mb-3">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border text-sm">
              <span className="truncate max-w-[80%]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-dashed border-2"
        >
          + Add {files.length > 0 ? "More " : ""}Files
        </Button>
        {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
      </div>
    </div>
  );
};

export default MultiFileUploader;
