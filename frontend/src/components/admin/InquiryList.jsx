import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const InquiryList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/inquiries`);
      setInquiries(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch inquiries");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/inquiries/${id}/status`, { status: newStatus });
      toast.success("Status updated");
      fetchInquiries();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/inquiries/${id}`);
      toast.success("Inquiry deleted");
      fetchInquiries();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const filteredInquiries = filter === 'All' 
    ? inquiries 
    : inquiries.filter(i => i.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Inquiries</h1>
        <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="All">All Inquiries</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredInquiries.map(inquiry => (
          <div key={inquiry._id} className="bg-white p-4 sm:p-6 rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${inquiry.type === 'Set' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {inquiry.type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                  <span className="text-gray-500 text-sm">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-semibold">{inquiry.contactInfo.name}</h3>
                <p className="text-sm text-gray-600">{inquiry.contactInfo.email}</p>
                {inquiry.baseItemName && <p className="text-sm text-gray-500 mt-1">Ref: {inquiry.baseItemName}</p>}
              </div>
              
              <div className="flex flex-row sm:flex-col gap-2 items-center sm:items-end w-full sm:w-auto justify-between sm:justify-start">
                <Select 
                    defaultValue={inquiry.status} 
                    onValueChange={(val) => handleStatusUpdate(inquiry._id, val)}
                >
                    <SelectTrigger className="w-[130px] sm:w-[140px] h-8">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2 mt-0 sm:mt-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/inquiries/${inquiry._id}`)}>
                    View Details
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(inquiry._id); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredInquiries.length === 0 && <p className="text-gray-500 text-center py-8">No inquiries found matching this filter.</p>}
      </div>
    </div>
  );
};

export default InquiryList;
