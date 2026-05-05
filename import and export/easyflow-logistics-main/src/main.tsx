import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
import "./index.css";
// 1. استيراد المكتبة 👇
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. إنشاء نسخة من الـ Client 👇
const queryClient = new QueryClient();

window.onerror = function(msg, url, line, col, error) {
  document.getElementById('root')!.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;"><h1>Global Error Caught</h1><p>${msg}</p><pre>${error?.stack}</pre></div>`;
};

window.addEventListener('unhandledrejection', function(event) {
  document.getElementById('root')!.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;"><h1>Unhandled Promise Rejection</h1><p>${event.reason}</p><pre>${event.reason?.stack}</pre></div>`;
});

// 3. تغليف التطبيق بالـ Provider 👇
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
