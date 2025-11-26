import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { RefreshCcwIcon, Filter, ChevronDown, ChevronUp } from "lucide-react";
import DiamondList from "./DiamondList";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const shapes = [
  { name: "Round", image: `${import.meta.env.BASE_URL}images/round.png` },
  { name: "Princess", image: `${import.meta.env.BASE_URL}images/princess.png` },
  { name: "Emerald", image: `${import.meta.env.BASE_URL}images/emerald.png` },
  { name: "Asscher", image: `${import.meta.env.BASE_URL}images/asscher.png` },
  { name: "Cushion", image: `${import.meta.env.BASE_URL}images/cushion.png` },
  { name: "Marquise", image: `${import.meta.env.BASE_URL}images/marquise.png` },
  { name: "Radiant", image: `${import.meta.env.BASE_URL}images/radiant.png` },
  { name: "Oval", image: `${import.meta.env.BASE_URL}images/oval.png` },
  { name: "Pear", image: `${import.meta.env.BASE_URL}images/pear.png` },
  { name: "Heart", image: `${import.meta.env.BASE_URL}images/heart.png` },
];

const cutOptions = ["Astor Ideal", "Ideal", "Very Good", "Good"];
const colorOptions = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const clarityOptions = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];

const DiamondDetail = () => {
  const { shape } = useParams();
  const [priceRange, setPriceRange] = useState([200, 5000000]);
  const [caratRange, setCaratRange] = useState([0.3, 30.0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter States
  const [selectedType, setSelectedType] = useState("Natural");
  const [selectedCut, setSelectedCut] = useState([]);
  const [selectedColor, setSelectedColor] = useState([]);
  const [selectedClarity, setSelectedClarity] = useState([]);
  
  // Advanced Filters
  const [selectedPolish, setSelectedPolish] = useState([]);
  const [selectedSymmetry, setSelectedSymmetry] = useState([]);
  const [selectedFluorescence, setSelectedFluorescence] = useState([]);
  const [tableRange, setTableRange] = useState([50, 80]);
  const [depthRange, setDepthRange] = useState([50, 80]);

  const toggleFilter = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Type Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Type</h3>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {["Natural", "Lab Grown"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                selectedType === type
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Price</h3>
        <Slider
          value={priceRange}
          min={200}
          max={5000000}
          step={100}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
            <Input 
              type="number" 
              value={priceRange[0]} 
              onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
              className="pl-6"
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
            <Input 
              type="number" 
              value={priceRange[1]} 
              onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
              className="pl-6"
            />
          </div>
        </div>
      </div>

      {/* Carat Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Carat</h3>
        <Slider
          value={caratRange}
          min={0.3}
          max={30.0}
          step={0.01}
          onValueChange={setCaratRange}
          className="mb-4"
        />
        <div className="flex gap-3">
          <Input 
            type="number" 
            value={caratRange[0]} 
            onChange={(e) => setCaratRange([+e.target.value, caratRange[1]])}
            step="0.01"
          />
          <Input 
            type="number" 
            value={caratRange[1]} 
            onChange={(e) => setCaratRange([caratRange[0], +e.target.value])}
            step="0.01"
          />
        </div>
      </div>

      {/* Cut Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Cut</h3>
        <div className="flex flex-wrap gap-2">
          {cutOptions.map((cut) => (
            <button
              key={cut}
              onClick={() => toggleFilter(cut, selectedCut, setSelectedCut)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                selectedCut.includes(cut)
                  ? "bg-navy-900 text-white border-navy-900"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}
            >
              {cut}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => toggleFilter(color, selectedColor, setSelectedColor)}
              className={`w-8 h-8 flex items-center justify-center text-xs rounded-full border transition-colors ${
                selectedColor.includes(color)
                  ? "bg-navy-900 text-white border-navy-900"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Clarity Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Clarity</h3>
        <div className="flex flex-wrap gap-2">
          {clarityOptions.map((clarity) => (
            <button
              key={clarity}
              onClick={() => toggleFilter(clarity, selectedClarity, setSelectedClarity)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                selectedClarity.includes(clarity)
                  ? "bg-navy-900 text-white border-navy-900"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}
            >
              {clarity}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-between p-0 hover:bg-transparent text-blue-600">
            <span>Advanced Filters</span>
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
           <div className="space-y-6">
             {/* Polish Filter */}
             <div>
               <h3 className="text-sm font-medium text-gray-900 mb-2">Polish</h3>
               <div className="flex flex-wrap gap-2">
                 {["Excellent", "Very Good", "Good", "Fair"].map((opt) => (
                   <button
                     key={opt}
                     onClick={() => toggleFilter(opt, selectedPolish, setSelectedPolish)}
                     className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                       selectedPolish.includes(opt) ? "bg-navy-900 text-white border-navy-900" : "bg-white text-gray-700 border-gray-200"
                     }`}
                   >
                     {opt}
                   </button>
                 ))}
               </div>
             </div>

             {/* Symmetry Filter */}
             <div>
               <h3 className="text-sm font-medium text-gray-900 mb-2">Symmetry</h3>
               <div className="flex flex-wrap gap-2">
                 {["Excellent", "Very Good", "Good", "Fair"].map((opt) => (
                   <button
                     key={opt}
                     onClick={() => toggleFilter(opt, selectedSymmetry, setSelectedSymmetry)}
                     className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                       selectedSymmetry.includes(opt) ? "bg-navy-900 text-white border-navy-900" : "bg-white text-gray-700 border-gray-200"
                     }`}
                   >
                     {opt}
                   </button>
                 ))}
               </div>
             </div>

             {/* Fluorescence Filter */}
             <div>
               <h3 className="text-sm font-medium text-gray-900 mb-2">Fluorescence</h3>
               <div className="flex flex-wrap gap-2">
                 {["None", "Faint", "Medium", "Strong", "Very Strong"].map((opt) => (
                   <button
                     key={opt}
                     onClick={() => toggleFilter(opt, selectedFluorescence, setSelectedFluorescence)}
                     className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                       selectedFluorescence.includes(opt) ? "bg-navy-900 text-white border-navy-900" : "bg-white text-gray-700 border-gray-200"
                     }`}
                   >
                     {opt}
                   </button>
                 ))}
               </div>
             </div>

             {/* Table % Filter */}
             <div>
               <h3 className="text-sm font-medium text-gray-900 mb-2">Table %</h3>
               <div className="flex gap-2 items-center">
                 <Input type="number" value={tableRange[0]} onChange={(e) => setTableRange([+e.target.value, tableRange[1]])} className="h-8 text-xs" />
                 <span className="text-gray-400">-</span>
                 <Input type="number" value={tableRange[1]} onChange={(e) => setTableRange([tableRange[0], +e.target.value])} className="h-8 text-xs" />
               </div>
             </div>

             {/* Depth % Filter */}
             <div>
               <h3 className="text-sm font-medium text-gray-900 mb-2">Depth %</h3>
               <div className="flex gap-2 items-center">
                 <Input type="number" value={depthRange[0]} onChange={(e) => setDepthRange([+e.target.value, depthRange[1]])} className="h-8 text-xs" />
                 <span className="text-gray-400">-</span>
                 <Input type="number" value={depthRange[1]} onChange={(e) => setDepthRange([depthRange[0], +e.target.value])} className="h-8 text-xs" />
               </div>
             </div>
           </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-50 border-b py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif text-navy-900 mb-4">Search Loose Diamonds</h1>
          <p className="text-gray-600 max-w-2xl">
            Explore our collection of GIA and IGI certified diamonds. Filter by shape, carat, cut, color, and clarity to find your perfect stone.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full flex gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl">Filters</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-500 hover:text-red-500 h-auto p-0"
                onClick={() => {
                  setPriceRange([200, 5000000]);
                  setCaratRange([0.3, 30.0]);
                  setSelectedCut([]);
                  setSelectedColor([]);
                  setSelectedClarity([]);
                  setSelectedType("Natural");
                  setSelectedPolish([]);
                  setSelectedSymmetry([]);
                  setSelectedFluorescence([]);
                  setTableRange([50, 80]);
                  setDepthRange([50, 80]);
                }}
              >
                Reset All
              </Button>
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-500 text-sm">Showing results for <span className="font-bold text-navy-900">{shape || "All Shapes"}</span></p>
            {/* Sort Dropdown could go here */}
          </div>
          
          <DiamondList 
            shape={shape} 
            filters={{
              type: selectedType,
              priceRange,
              caratRange,
              cut: selectedCut,
              color: selectedColor,
              clarity: selectedClarity,
              polish: selectedPolish,
              symmetry: selectedSymmetry,
              fluorescence: selectedFluorescence,
              tableRange,
              depthRange
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default DiamondDetail;