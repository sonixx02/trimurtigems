import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Navbar from './Navbar';

const JewelryList = () => {
  const [jewelry, setJewelry] = useState([]);
  const [filteredJewelry, setFilteredJewelry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const categoryParam = searchParams.get("category") || "All";
  const [categoryFilter, setCategoryFilter] = useState(categoryParam);
  const [priceRange, setPriceRange] = useState([0, 50000]);

  useEffect(() => {
    fetchJewelry();
  }, []);

  useEffect(() => {
    setCategoryFilter(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    filterJewelry();
  }, [categoryFilter, priceRange, jewelry]);

  const fetchJewelry = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jewelry`);
      setJewelry(res.data);
      setFilteredJewelry(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const filterJewelry = () => {
    let result = jewelry;

    if (categoryFilter && categoryFilter !== "All") {
      result = result.filter(item => item.category === categoryFilter);
    }

    result = result.filter(item => item.price >= priceRange[0] && item.price <= priceRange[1]);

    setFilteredJewelry(result);
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    setSearchParams({ category: val === "All" ? "" : val });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Jewelry</SelectItem>
                  {["Ring", "Necklace", "Earrings", "Bracelet", "Pendant"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Price Range</h3>
              <Slider 
                defaultValue={[0, 50000]} 
                max={50000} 
                step={100} 
                value={priceRange} 
                onValueChange={setPriceRange}
                className="my-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}+</span>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {location.state?.diamond && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <div>
                  <p className="text-blue-900 font-medium">Selecting a setting for your diamond</p>
                  <p className="text-sm text-blue-700">{location.state.diamond.carat}ct {location.state.diamond.shape} Diamond</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200">
                  Change Diamond
                </Button>
              </div>
            )}

            <h1 className="text-3xl font-serif mb-6 text-navy-900">
              {categoryFilter === "All" ? "Fine Jewelry Collection" : `${categoryFilter}s`}
            </h1>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : filteredJewelry.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No items found matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJewelry.map((item) => (
                  <Link key={item._id} to={`/jewelry/${item._id}`} state={{ diamond: location.state?.diamond }}>
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-none shadow-sm group">
                      <div className="relative overflow-hidden rounded-t-lg aspect-square bg-gray-50">
                        {item.images && item.images.length > 0 ? (
                          <img 
                            src={`${import.meta.env.VITE_BACKEND_URL}${item.images[0]}`} 
                            alt={item.name} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            No Image
                          </div>
                        )}
                        {item.threeDModelUrl && (
                          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-medium text-blue-800">
                            3D View
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-medium text-lg text-gray-900 line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{item.metal} {item.gemstone ? `• ${item.gemstone}` : ''}</p>
                        <p className="font-semibold text-navy-900">${item.price.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JewelryList;
