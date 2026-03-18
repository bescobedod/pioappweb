"use client";
import { useState, useEffect } from "react";
import { Header } from "./src/Header";
import { HomeView } from "./src/HomeView";
import { VisitsView } from "./src/VisitsView";
import { DeliveryView } from "./src/DeliveryView";
import { EmergencyVisitsView } from "./src/EmergencyVisitsView";
import { EmergencyVisitDetail } from "./src/EmergencyVisitDetail";
import { LoginView } from "./src/LoginView";
import { Home, LogOut, X } from "lucide-react";
import { VwDetalleVisitaEmergencia } from "./src/types/VisitaEmergencia";
import { VwDetalleCaso } from "./src/types/Caso";
import { CaseView } from "./src/CaseView";
import { CasesView } from "./src/CasesView";
import { CaseDetail } from "./src/CaseDetailView";
import { FinalCaseDetail } from "./src/FinalCaseView";
import { CasesPermissionsView } from "./src/CasesPermissionsView";
import { PublicationsView } from "./src/PublicationsView";
// import { ReturnAuthorizationView } from "./src/ReturnAuthorizationView";
// import { CreditNotesView } from "./src/CreditNotesView";
import { useAuth } from "./src/api/context/AuthContext";

type View =
  | "home"
  | "visitas"
  | "agregar"
  | "emergencias"
  | "emergencia-detalle"
  | "caso"
  | "casos"
  | "caso-detalle"
  | "caso-cierre"
  | "casos-permisos"
  | "publicaciones"
  // | "devoluciones"
  // | "notas-credito"
  ;

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [previousView, setPreviousView] = useState<View | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEmergencyVisit, setSelectedEmergencyVisit] = useState<VwDetalleVisitaEmergencia | null>(null);
  const [selectedCase, setSelectedCase] = useState<VwDetalleCaso | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const idRol = user?.rol != null ? String(user.rol) : null;

  function getJwtExpMs(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return typeof payload?.exp === "number" ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  function isJwtExpired(token: string, skewMs = 5000): boolean {
    const expMs = getJwtExpMs(token);
    if (!expMs) return false;
    return Date.now() >= expMs - skewMs;
  }
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || isJwtExpired(token)) {
      localStorage.clear();
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);


  const handleLogin = () => {
    setIsAuthenticated(true);
    navigateTo("home");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigateTo("home");
    setIsMobileMenuOpen(false);
    localStorage.clear();
  };

  const handleSelectEmergencyVisit = (visit: VwDetalleVisitaEmergencia) => {
    setSelectedEmergencyVisit(visit);
    navigateTo("emergencia-detalle");
  };


  const handleSelectCase = (
    caso: VwDetalleCaso
  ) => {
    setSelectedCase(caso);
    navigateTo("caso-detalle");
  };

  const navigateTo = (view: View) => {
    setPreviousView(currentView)
    setCurrentView(view);
  };

  const handleBack = () => {
    if (previousView) {
      setCurrentView(previousView);
    } else {
      setCurrentView("home");
    }
  };

  const handleBackFromDeliveryView = () => {
    if (previousView) {
      setCurrentView(previousView);
    } else {
      setCurrentView("casos");
    }
  };

  if (isAuthenticated === false) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        currentView={currentView}
        onViewChange={navigateTo}
        onLogout={handleLogout}
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <div className="flex pt-[60px]">
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 lg:mr-64">
          <div className="max-w-6xl mx-auto">
            {currentView === "home" && (
              <HomeView onNavigate={navigateTo} />
            )}
            {currentView === "visitas" && <VisitsView />}
            {currentView === "agregar" && (
              <DeliveryView
                caso={selectedCase!}
                onBack={handleBackFromDeliveryView}
              />
            )}
            {currentView === "caso" && <CaseView/>}
            {currentView === "casos" && (
              <CasesView
                onNavigate={navigateTo}
                onSelectCaso={handleSelectCase}
                onSelectEmergencyVisit={handleSelectEmergencyVisit}
              />
            )}
            {currentView === "caso-detalle" && (
              <CaseDetail
                caso={selectedCase!}
                onBack={handleBack}
              />
            )}
            {currentView === "caso-cierre" && (
              <FinalCaseDetail
                caso={selectedCase!}
                onBack={handleBack}
              />
            )}
            {currentView === "casos-permisos" && <CasesPermissionsView/>}
            {currentView === "emergencias" && (
              <EmergencyVisitsView
                onNavigate={navigateTo}
                onSelectVisit={handleSelectEmergencyVisit}
              />
            )}
            {currentView === "emergencia-detalle" && (
              <EmergencyVisitDetail
                visit={selectedEmergencyVisit!}
                onBack={handleBack}
              />
            )}
            {currentView === "publicaciones" && <PublicationsView/>}
            {/* {currentView === "devoluciones" && <ReturnAuthorizationView/>}
            {currentView === "notas-credito" && <CreditNotesView/>} */}
          </div>
        </div>
        <aside className="hidden lg:block w-64 bg-white shadow-2xl border-l border-gray-200 fixed top-[110px] right-0 bottom-0 h-[calc(100vh-80px)]">
          <div className="p-6 flex flex-col h-full">
            <div className="mb-8 pb-4 border-b border-gray-200">
              <h2 className="text-gray-900">Menú</h2>
            </div>
            <nav className="space-y-3">
              <button
                onClick={() => navigateTo("home")}
                className="w-full text-left px-5 py-4 rounded-xl transition-all text-gray-700 hover:bg-gray-100 flex items-center group"
              >
                <Home
                  size={20}
                  className="mr-3 text-gray-600 group-hover:text-[#fcb900]"
                />
                <span>Inicio</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-5 py-4 rounded-xl transition-all text-red-600 hover:bg-red-50 flex items-center group"
              >
                <LogOut size={20} className="mr-3" />
                <span>Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        </aside>
        {isMobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40 top-[80px]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="lg:hidden fixed top-[80px] right-0 bottom-0 w-64 bg-white shadow-2xl z-50">
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <h2 className="text-gray-900">Menú</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
                <nav className="space-y-3">
                  <button
                    onClick={() => {
                      navigateTo("home");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-4 rounded-xl transition-all text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Home size={20} className="mr-3" />
                    <span>Inicio</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-4 rounded-xl transition-all text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut size={20} className="mr-3" />
                    <span>Cerrar Sesión</span>
                  </button>
                </nav>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}