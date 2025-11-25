import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Search } from "lucide-react";
import { toast } from "sonner";

const ManageDiamonds = () => {
  const [diamonds, setDiamonds] = useState([]);
  const [filteredDiamonds, setFilteredDiamonds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [shapeFilter, setShapeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");

  const fetchDiamonds = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds`);
      setDiamonds(res.data);
      setFilteredDiamonds(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch diamonds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiamonds();
  }, []);

  useEffect(() => {
    let result = diamonds;

    if (search) {
      result = result.filter(d => 
        d.stockNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (shapeFilter !== "all") {
      result = result.filter(d => d.shape === shapeFilter);
    }

    if (colorFilter !== "all") {
      result = result.filter(d => d.color === colorFilter);
    }

    setFilteredDiamonds(result);
  }, [search, shapeFilter, colorFilter, diamonds]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this diamond?")) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/diamonds/${id}`);
      toast.success("Diamond deleted successfully");
      fetchDiamonds(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete diamond");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Manage Diamonds</h2>
        <Button onClick={fetchDiamonds}>Refresh List</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Stock Number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <Select value={shapeFilter} onValueChange={setShapeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Shape" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shapes</SelectItem>
              {["Round", "Princess", "Emerald", "Cushion", "Oval", "Pear", "Heart", "Radiant", "Marquise", "Asscher"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select value={colorFilter} onValueChange={setColorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"].map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock #</TableHead>
              <TableHead>Shape</TableHead>
              <TableHead>Carat</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Clarity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiamonds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No diamonds found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredDiamonds.map((diamond) => (
                <TableRow key={diamond._id}>
                  <TableCell className="font-medium">{diamond.stockNumber}</TableCell>
                  <TableCell>{diamond.shape}</TableCell>
                  <TableCell>{diamond.carat}</TableCell>
                  <TableCell>{diamond.color}</TableCell>
                  <TableCell>{diamond.clarity}</TableCell>
                  <TableCell>${diamond.price?.toLocaleString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link to={`/admin/edit/${diamond._id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(diamond._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageDiamonds;
