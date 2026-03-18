import Image from "next/image";
import logo from "@/assets/img/LOGOPINULITOORIGINAL.png";
import { Menu, User } from "lucide-react";
import { useEffect } from "react";

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

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const date = new Date().toLocaleDateString("es-ES");

export function Header({ onMenuToggle, onViewChange}: HeaderProps) {
  const nombre = localStorage.getItem("nombre");
  const puesto = localStorage.getItem("puesto");
    
  useEffect(() => {
    const date = new Date().toLocaleDateString("es-ES");
  })

  const navigateTo = (view: View) => {
    onViewChange(view);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#fcb900] shadow-lg border-b border-yellow-600/20 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex justify-between items-center gap-4">
          <button
          onClick={() => {
            navigateTo("home");
          }}
          className="cursor-pointer"
          >
            <div  className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 sm:w-12 flex-shrink-0">
                <Image
                  src={logo}
                  width={45}
                  height={50}
                  alt="Logo Pinulito"
                  className="object-contain"
                />
              </div>
              <div className="pl-3 border-l border-red-600 text-red-600 font-bold truncate">
                <h2 className="text-sm sm:text-base leading-tight">PioApp</h2>
                <p className="text-xs sm:text-sm">Administrador</p>
              </div>
            </div>
          </button>
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-yellow-600/30">
            <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center">
              <User size={18} className="text-[#fcb900]" />
            </div>
            <div className="text-right leading-tight">
              <p className="text-gray-900 text-sm font-semibold">
                {nombre}
              </p>
              <p className="text-gray-800 text-xs">{puesto}</p>
              <p className="text-gray-800 text-xs">{date}</p>
            </div>
          </div>
          <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-yellow-600/30">
            <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
              <User size={14} className="text-[#fcb900]" />
            </div>
            <div className="text-right leading-tight">
              <p className="text-gray-900 text-xs font-semibold">
                {nombre}
              </p>
              <p className="text-gray-800 text-[10px]">{puesto}</p>
            </div>
          </div>
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-yellow-600/20 rounded-lg transition-colors flex-shrink-0"
          >
            <Menu size={24} className="text-gray-900" />
          </button>
        </div>
      </div>
    </header>
  );
}