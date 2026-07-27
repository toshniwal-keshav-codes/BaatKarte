import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminRoute } from "./components/admin/AdminRoute";

const IndexPage = lazy(() => import("./pages/Index"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const VerifyOtpPage = lazy(() => import("./pages/VerifyOtp"));
const InboxPage = lazy(() => import("./pages/Inbox"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboard"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#040303] flex items-center justify-[#center] justify-center">
      <div className="w-8 h-8 border-2 border-[#3A4E48] border-t-[#8B9D83] rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}