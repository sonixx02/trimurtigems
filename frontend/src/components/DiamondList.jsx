import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DiamondList = ({ shape, filters }) => {
  const [diamonds, setDiamonds] = useState([]);
  const [filteredDiamonds, setFilteredDiamonds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiamonds = async () => {
      setLoading(true);
      setError(null);
      setDiamonds([]);

      try {
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/diamonds/?shape=${shape}`;
        const response = await axios.get(apiUrl);
        setDiamonds(response.data);
        setFilteredDiamonds(response.data);
      } catch (err) {
        setError("Failed to fetch diamonds. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (shape) {
      fetchDiamonds();
    }
  }, [shape]);

  useEffect(() => {
    if (!diamonds.length) return;

    let result = diamonds;

    // Filter by Type (Natural vs Lab Grown)
    if (filters?.type) {
      result = result.filter(d => (d.type || "Natural") === filters.type);
    }

    // Filter by Price
    if (filters?.priceRange) {
      result = result.filter(d => d.price >= filters.priceRange[0] && d.price <= filters.priceRange[1]);
    }

    // Filter by Carat
    if (filters?.caratRange) {
      result = result.filter(d => d.carat >= filters.caratRange[0] && d.carat <= filters.caratRange[1]);
    }

    // Filter by Cut
    if (filters?.cut && filters.cut.length > 0) {
      result = result.filter(d => filters.cut.includes(d.cut));
    }

    // Filter by Color
    if (filters?.color && filters.color.length > 0) {
      result = result.filter(d => filters.color.includes(d.color));
    }

    // Filter by Clarity
    if (filters?.clarity && filters.clarity.length > 0) {
      result = result.filter(d => filters.clarity.includes(d.clarity));
    }

    // Filter by Polish
    if (filters?.polish && filters.polish.length > 0) {
      result = result.filter(d => filters.polish.includes(d.polish));
    }

    // Filter by Symmetry
    if (filters?.symmetry && filters.symmetry.length > 0) {
      result = result.filter(d => filters.symmetry.includes(d.symmetry));
    }

    // Filter by Fluorescence
    if (filters?.fluorescence && filters.fluorescence.length > 0) {
      result = result.filter(d => filters.fluorescence.includes(d.fluorescence));
    }

    // Filter by Table
    if (filters?.tableRange) {
      result = result.filter(d => (!d.table || (d.table >= filters.tableRange[0] && d.table <= filters.tableRange[1])));
    }

    // Filter by Depth
    if (filters?.depthRange) {
      result = result.filter(d => (!d.depth || (d.depth >= filters.depthRange[0] && d.depth <= filters.depthRange[1])));
    }

    setFilteredDiamonds(result);
  }, [diamonds, filters]);

  // Handle diamond click
  const handleDiamondClick = (diamondId) => {
    navigate(`/diamonds/${shape}/${diamondId}`);
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>;
  if (error) return <p className="text-red-500 text-center p-8">{error}</p>;

  if (filteredDiamonds.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">No diamonds found matching your criteria.</p>
        <p className="text-sm text-gray-400 mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-center sm:text-left text-navy-900">
        {filteredDiamonds.length} {shape} Diamonds Found
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiamonds.map((diamond) => (
          <div 
            key={diamond._id}
            onClick={() => handleDiamondClick(diamond._id)}
            className="group p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all bg-white cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 z-10">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                diamond.type === 'Lab Grown' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {diamond.type || 'Natural'}
              </span>
            </div>

            <div className="mb-4 w-full h-48 overflow-hidden rounded-lg bg-gray-50 relative">
              {diamond.imageUrl ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}${diamond.imageUrl}`}
                  alt={`${diamond.shape} Diamond`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <span className="text-4xl">💎</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-serif font-bold text-navy-900">
                  {diamond.carat} Carat {diamond.shape}
                </h4>
                <p className="font-bold text-lg text-navy-900">${diamond.price.toLocaleString()}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 pt-2 border-t">
                <div className="text-center p-1 bg-gray-50 rounded">
                  <span className="block text-gray-400 uppercase text-[10px]">Color</span>
                  <span className="font-semibold">{diamond.color}</span>
                </div>
                <div className="text-center p-1 bg-gray-50 rounded">
                  <span className="block text-gray-400 uppercase text-[10px]">Clarity</span>
                  <span className="font-semibold">{diamond.clarity}</span>
                </div>
                <div className="text-center p-1 bg-gray-50 rounded">
                  <span className="block text-gray-400 uppercase text-[10px]">Cut</span>
                  <span className="font-semibold">{diamond.cut}</span>
                </div>
              </div>
              
              <div className="pt-2 flex justify-between items-center text-xs text-gray-500">
                <span>Stock #: {diamond.stockNumber}</span>
                {diamond.stockStatus === "In Stock" ? (
                   <span className="text-green-600 font-medium">In Stock</span>
                ) : (
                   <span className="text-orange-500 font-medium">{diamond.stockStatus}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiamondList;