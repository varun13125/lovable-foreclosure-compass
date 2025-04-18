
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Clients from "./pages/Clients";
import CaseDetail from "./pages/CaseDetail";
import NewCase from "./pages/NewCase";
import NotFound from "./pages/NotFound";
import Cases from "./pages/Cases";
import Documents from "./pages/Documents";
import ViewDocument from "./pages/ViewDocument";
import Messages from "./pages/Messages";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import Admin from "./pages/Admin";
import MasterAdmin from "./pages/MasterAdmin";
import Auth from "./pages/Auth";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/case/:id" element={<CaseDetail />} />
              <Route path="/new-case" element={<NewCase />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/document/:id" element={<ViewDocument />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/master-admin" element={<MasterAdmin />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
