import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from './Navbar';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, FileText, User } from 'lucide-react';

const UserDashboard = () => {
  const { user, logout, loading } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [favorites, setFavorites] = useState([]); // In a real app, we'd fetch full details
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchInquiries = async () => {
      if (user?.token) {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/inquiries/my-inquiries`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setInquiries(data);
        } catch (error) {
          console.error("Failed to fetch inquiries", error);
        }
      }
    };
    fetchInquiries();
  }, [user]);

  // Fetch favorite details (simplified for now, assuming we have IDs in user.favorites)
  // Ideally we would have an endpoint to get full favorite items details
  
  if (loading || !user) return <div>Loading...</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-navy-900">My Dashboard</h1>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>

        <Tabs defaultValue="inquiries" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="inquiries" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> My Inquiries
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> Favorites
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inquiries">
            <div className="grid gap-4">
              {inquiries.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">You haven't made any inquiries yet.</p>
                </div>
              ) : (
                inquiries.map((inquiry) => (
                  <Card key={inquiry._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">
                        {inquiry.type === 'Single Item' ? inquiry.baseItemName : 'Custom Inquiry'}
                      </CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-2">Submitted on {new Date(inquiry.createdAt).toLocaleDateString()}</p>
                      <p className="text-gray-700">{inquiry.customNotes || "No additional notes."}</p>
                      {inquiry.selectedDiamonds && inquiry.selectedDiamonds.length > 0 && (
                         <div className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold">Diamonds:</span> {inquiry.selectedDiamonds.length} selected
                         </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="bg-white p-6 rounded-lg shadow-sm">
               <h3 className="text-lg font-medium mb-4">My Favorites</h3>
               {user.favorites.length === 0 ? (
                 <p className="text-gray-500">No favorites added yet.</p>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {user.favorites.map((fav, idx) => (
                     <div key={idx} className="border p-4 rounded flex justify-between items-center">
                       <div>
                         <p className="font-bold">{fav.itemType}</p>
                         <Link 
                            to={fav.itemType === 'Diamond' ? `/diamonds/round/${fav.itemId}` : `/jewelry/${fav.itemId}`}
                            className="text-sm text-blue-600 hover:underline"
                         >
                           View Item
                         </Link>
                       </div>
                       <span className="text-xs text-gray-400">Added {new Date(fav.addedAt).toLocaleDateString()}</span>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Role</label>
                  <p className="text-lg capitalize">{user.role}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
