import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import axios from 'axios';

// استيراد الصفحات الأساسية
import Login from "./pages/Login";
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



import TodoList from "./pages/my-tasks"; 
import Feedback from "./pages/send";     

const queryClient = new QueryClient();

// إعداد المحترض (Interceptor)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🛡️ مكون حماية الروتس بنظام الـ Layout الموحد
const ProtectedLayout = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppLayout>
      <Outlet /> 
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          {/* 🔓 صفحة اللوجين (خارج الـ Layout) */}
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 🔒 كل الروتس الجاية محمية وجوه الـ AppLayout تلقائياً */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* الشحن والعمليات */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/containers" element={<Containers />} />
            <Route path="/packing-lists" element={<PackingLists />} />
            
            {/* العملاء والموردين */}
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/:id" element={<SupplierDetails />} />
            
            {/* المالية والبنوك */}
            <Route path="/financials" element={<Financials />} />
            <Route path="/banks" element={<Banks />} />
            <Route path="/commissions" element={<Commissions />} />
            
            {/* وكلاء الشحن والموظفين */}
            <Route path="/shipping-agents" element={<ShippingAgents />} />
            <Route path="/shipping-agents/:id" element={<ShippingAgentDetails />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/products" element={<Products />} />
            <Route path="/archive" element={<ArchivePage />} />

            {/* ✨ الأنظمة المضافة حديثاً (الربط الجديد) */}
            <Route path="/todo" element={<TodoList />} />
            <Route path="/feedback" element={<Feedback />} />
          </Route>

          {/* صفحة 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;