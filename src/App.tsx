
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Clients from "./pages/Clients";
import CaseDetail from "./pages/CaseDetail";
import NewCase from "./pages/NewCase";
import NotFound from "./pages/NotFound";
import Cases from "./pages/Cases";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/case/:id" element={<CaseDetail />} />
          <Route path="/new-case" element={<NewCase />} />
          <Route path="/documents" element={<Index />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/messages" element={<Index />} />
          <Route path="/reports" element={<Index />} />
          <Route path="/settings" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
