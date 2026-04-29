import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Suppliers from "./pages/Suppliers";
import SupplierDetails from "./pages/SupplierDetails";
import Products from "./pages/Products";
import Containers from "./pages/Containers";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Financials from "./pages/Financials";
import Banks from "./pages/Banks";
import ArchivePage from "./pages/Archive";
import ShippingAgents from "./pages/ShippingAgents";
import ShippingAgentDetails from "./pages/ShippingAgentDetails";
import Employees from "./pages/Employees";
import PackingLists from "./pages/PackingLists";
import Commissions from "./pages/Commissions";
import Operations from "./pages/Operations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/:id" element={<SupplierDetails />} />
            <Route path="/products" element={<Products />} />
            <Route path="/containers" element={<Containers />} />
            <Route path="/financials" element={<Financials />} />
            <Route path="/banks" element={<Banks />} />
            <Route path="/shipping-agents" element={<ShippingAgents />} />
            <Route path="/shipping-agents/:id" element={<ShippingAgentDetails />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/packing-lists" element={<PackingLists />} />
            <Route path="/commissions" element={<Commissions />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
// Triggering TS Server re-read
