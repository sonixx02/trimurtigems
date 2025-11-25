import React from 'react';
import { useCompare } from '../hooks/useCompare';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Check, Minus } from "lucide-react";
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const ComparePage = () => {
  const { compareList, removeFromCompare } = useCompare();

  const renderValue = (val) => {
    if (val === true) return <Check className="w-4 h-4 text-green-500 mx-auto" />;
    if (val === false || val === null || val === undefined) return <Minus className="w-4 h-4 text-gray-300 mx-auto" />;
    return val;
  };

  const DiamondComparison = () => {
    if (compareList.diamonds.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No diamonds in comparison list.</p>
          <Link to="/diamonds/round">
            <Button>Browse Diamonds</Button>
          </Link>
        </div>
      );
    }

    const features = [
      { label: "Shape", key: "shape" },
      { label: "Carat", key: "carat" },
      { label: "Color", key: "color" },
      { label: "Clarity", key: "clarity" },
      { label: "Cut", key: "cut" },
      { label: "Price", key: "price", format: (v) => `$${v?.toLocaleString()}` },
      { label: "Polish", key: "polish" },
      { label: "Symmetry", key: "symmetry" },
      { label: "Fluorescence", key: "fluorescence" },
      { label: "Table %", key: "table" },
      { label: "Depth %", key: "depth" },
      { label: "L/W Ratio", key: "lengthWidthRatio" },
      { label: "Lab", key: "certification" },
    ];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left min-w-[150px] bg-gray-50">Feature</th>
              {compareList.diamonds.map(d => (
                <th key={d._id} className="p-4 min-w-[200px] border-l relative bg-white">
                  <button 
                    onClick={() => removeFromCompare(d._id, 'diamonds')}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="h-32 w-full mb-2 flex items-center justify-center">
                     <img 
                      src={`${import.meta.env.VITE_BACKEND_URL}${d.imageUrl}`} 
                      alt={d.shape}
                      className="max-h-full max-w-full object-contain"
                     />
                  </div>
                  <Link to={`/diamonds/${d.shape.toLowerCase()}/${d._id}`} className="text-navy-900 hover:underline">
                    {d.carat}ct {d.shape}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map(f => (
              <tr key={f.key} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-600 bg-gray-50/50">{f.label}</td>
                {compareList.diamonds.map(d => (
                  <td key={d._id} className="p-4 text-center border-l">
                    {f.format ? f.format(d[f.key]) : renderValue(d[f.key])}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t">
               <td className="p-4 bg-gray-50/50"></td>
               {compareList.diamonds.map(d => (
                 <td key={d._id} className="p-4 text-center border-l">
                   <Link to={`/diamonds/${d.shape.toLowerCase()}/${d._id}`}>
                     <Button className="w-full">View Details</Button>
                   </Link>
                 </td>
               ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const JewelryComparison = () => {
    if (compareList.jewelry.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No jewelry in comparison list.</p>
          <Link to="/jewelry">
            <Button>Browse Jewelry</Button>
          </Link>
        </div>
      );
    }

    const features = [
      { label: "Name", key: "name" },
      { label: "Price", key: "price", format: (v) => `$${v?.toLocaleString()}` },
      { label: "Category", key: "category" },
      { label: "Metal", key: "metal" },
      { label: "Gemstone", key: "gemstone" },
      { label: "Stock Status", key: "stockStatus" },
    ];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left min-w-[150px] bg-gray-50">Feature</th>
              {compareList.jewelry.map(j => (
                <th key={j._id} className="p-4 min-w-[200px] border-l relative bg-white">
                  <button 
                    onClick={() => removeFromCompare(j._id, 'jewelry')}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="h-32 w-full mb-2 flex items-center justify-center">
                     <img 
                      src={`${import.meta.env.VITE_BACKEND_URL}${j.images?.[0]}`} 
                      alt={j.name}
                      className="max-h-full max-w-full object-contain"
                     />
                  </div>
                  <Link to={`/jewelry/${j._id}`} className="text-navy-900 hover:underline">
                    {j.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map(f => (
              <tr key={f.key} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-600 bg-gray-50/50">{f.label}</td>
                {compareList.jewelry.map(j => (
                  <td key={j._id} className="p-4 text-center border-l">
                    {f.format ? f.format(j[f.key]) : renderValue(j[f.key])}
                  </td>
                ))}
              </tr>
            ))}
             <tr className="border-t">
               <td className="p-4 bg-gray-50/50"></td>
               {compareList.jewelry.map(j => (
                 <td key={j._id} className="p-4 text-center border-l">
                   <Link to={`/jewelry/${j._id}`}>
                     <Button className="w-full">View Details</Button>
                   </Link>
                 </td>
               ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-serif text-navy-900 mb-8">Compare Items</h1>
        
        <Tabs defaultValue="diamonds" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="diamonds">Diamonds ({compareList.diamonds.length})</TabsTrigger>
            <TabsTrigger value="jewelry">Jewelry ({compareList.jewelry.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diamonds">
            <DiamondComparison />
          </TabsContent>
          
          <TabsContent value="jewelry">
            <JewelryComparison />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComparePage;
