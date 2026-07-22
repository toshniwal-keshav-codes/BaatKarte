import { Routes, Route } from "react-router-dom";
import IndexPage from "./pages/Index";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import VerifyOtpPage from "./pages/VerifyOtp";
import InboxPage from "./pages/Inbox";
import AdminDashboardPage from "./pages/AdminDashboard";
import { AdminRoute } from "./components/admin/AdminRoute";
import NotFoundPage from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/inbox" element={<InboxPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}