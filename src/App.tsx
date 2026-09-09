import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { initYandexMetrika } from "@/lib/metrika";

const IndexPage = lazy(() => import("./pages/Index"));
const AdminPage = lazy(() => import("./pages/Admin"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicy"));
const ConsentPage = lazy(() => import("./pages/Consent"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));

const METRIKA_ID = import.meta.env.VITE_YANDEX_METRIKA_ID ?? "105075135";

const App = () => {
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    if (!METRIKA_ID) {
      return;
    }

    initYandexMetrika(METRIKA_ID);

    const idleHandle = window.requestIdleCallback
      ? window.requestIdleCallback(() => setIsClientReady(true), { timeout: 1500 })
      : window.setTimeout(() => setIsClientReady(true), 500);

    return () => {
      if (window.requestIdleCallback && typeof idleHandle === "number") {
        window.cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle as number);
      }
    };
  }, []);

  return (
    <TooltipProvider>
      {isClientReady && (
        <>
          <Toaster />
          <Sonner />
        </>
      )}
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground" role="status" aria-live="polite">
              Загрузка...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/consent" element={<ConsentPage />} />
            <Route path="/personal-data-consent" element={<ConsentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
