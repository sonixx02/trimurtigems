import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DiamondShapes from "./components/DiamondShapes";
import ExploreSection from "./components/ExploreSection";
import DiamondDetail from "./components/DiamondDetail";
import DiamondView from "./components/DiamondView";
import RingDesigner from "./components/RingDesigner";
import JewelryList from "./components/JewelryList";
import JewelryDetail from "./components/JewelryDetail";

// Admin Components
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AddDiamond from "./components/admin/AddDiamond";
import EditDiamond from "./components/admin/EditDiamond";
import ManageDiamonds from "./components/admin/ManageDiamonds";
import AddJewelry from "./components/admin/AddJewelry";
import ManageJewelry from "./components/admin/ManageJewelry";
import EditJewelry from "./components/admin/EditJewelry";
import BuildSet from "./components/BuildSet";
import ComparePage from "./components/ComparePage";
import InquiryList from "./components/admin/InquiryList";
import InquiryDetail from "./components/admin/InquiryDetail";
import Login from "./components/admin/Login";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import UserLogin from "./components/UserLogin";
import UserRegister from "./components/UserRegister";
import UserDashboard from "./components/UserDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/trimurtigems">
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <main>
                    <Hero />
                    <DiamondShapes />
                    <ExploreSection />
                  </main>
                </>
              }
            />
            <Route path="/diamonds/:shape" element={<><Navbar /><main><DiamondDetail /></main></>} />
            <Route path="/diamonds/:shape/:id" element={<><Navbar /><main><DiamondView /></main></>} />
            <Route path="/jewelry" element={<JewelryList />} />
            <Route path="/jewelry/:id" element={<JewelryDetail />} />
            <Route path="/ringdesigner" element={<><Navbar /><main><RingDesigner /></main></>} />
            <Route path="/build-set" element={<><Navbar /><main><BuildSet /></main></>} />
            <Route path="/compare" element={<><Navbar /><main><ComparePage /></main></>} />

            {/* Login Route */}
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="add" element={<AddDiamond />} />
              <Route path="edit/:id" element={<EditDiamond />} />
              <Route path="manage" element={<ManageDiamonds />} />
              <Route path="add-jewelry" element={<AddJewelry />} />
              <Route path="manage-jewelry" element={<ManageJewelry />} />
              <Route path="edit-jewelry/:id" element={<EditJewelry />} />
              <Route path="inquiries" element={<InquiryList />} />
              <Route path="inquiries/:id" element={<InquiryDetail />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;