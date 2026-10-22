import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { EmailProvider } from "./context/EmailContext";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Inbox from "./pages/Inbox";
import EmailDetails from "./pages/EmailDetails";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inbox" replace />} />

      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/:folder" element={<Inbox />} />
          <Route path="/email/:id" element={<EmailDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/inbox" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EmailProvider>
        <AppRoutes />
      </EmailProvider>
    </AuthProvider>
  );
}