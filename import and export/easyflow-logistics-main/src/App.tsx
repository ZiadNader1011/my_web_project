import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import axios from 'axios';
import { MyTasksPage } from "@/components/pages/MyTasksPage";
import { SendPage } from "@/components/pages/SendPage";
import { TaskProvider } from "@/store/tasks"; // تأكدي إن المسار ده صح عندك في المشروع

// استيراد الصفحات
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
import { I18nProvider } from "./i18n/I18nProvider";
import { AuthProvider } from "./auth/AuthProvider";

const queryClient = new QueryClient();

// إعداد المحترض (Interceptor) لإرسال التوكن تلقائياً
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// مكون لحماية الروتس (لو مفيش توكن يرجعه للوجين)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
      <TaskProvider>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* صفحة اللوجين خارج الـ AppLayout عشان تظهر شاشة كاملة */}
          <Route path="/login" element={<Login />} />
          
          {}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
<Route path="/feedback" element={<ProtectedRoute><SendPage /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
          <Route path="/suppliers/:id" element={<ProtectedRoute><SupplierDetails /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/containers" element={<ProtectedRoute><Containers /></ProtectedRoute>} />
          <Route path="/financials" element={<ProtectedRoute><Financials /></ProtectedRoute>} />
          <Route path="/banks" element={<ProtectedRoute><Banks /></ProtectedRoute>} />
          <Route path="/shipping-agents" element={<ProtectedRoute><ShippingAgents /></ProtectedRoute>} />
          <Route path="/shipping-agents/:id" element={<ProtectedRoute><ShippingAgentDetails /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
          <Route path="/packing-lists" element={<ProtectedRoute><PackingLists /></ProtectedRoute>} />
          <Route path="/commissions" element={<ProtectedRoute><Commissions /></ProtectedRoute>} />
          <Route path="/operations" element={<ProtectedRoute><Operations /></ProtectedRoute>} />
          <Route path="/archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />

          {/* صفحة 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </TaskProvider>
    </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
 
);

export default App;