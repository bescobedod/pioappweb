import { useEffect, useState } from "react";
import {
  AlertCircle,
  MapPin,
  Target,
  ChevronRight,
  Folder,
  Search,
  Layers,
  FolderOpen,
  FileDown,
  Calendar,
  UserIcon
} from "lucide-react";
import { Input } from "./ui/input";
import { getCasosByDivision } from "./api/CasoApi";
import { getVisitasEmergenciaByCaso } from "./api/VisitaApi";
import { VwDetalleCaso } from "./types/Caso";
import { VisitaEmergencia, VwDetalleVisitaEmergencia } from "./types/VisitaEmergencia";
import { useAuth } from "./api/context/AuthContext";
import { exportCasosExcel } from "../src/services/ExportCasosExcel";
import { Button } from "./ui/button";

interface CasesViewProps {
    onNavigate: (view: "casos" | "caso-detalle" | "caso-cierre" | "agregar" | "emergencia-detalle") => void;
    onSelectCaso: (caso: VwDetalleCaso) => void;
    onSelectEmergencyVisit: (visit: VwDetalleVisitaEmergencia) => void;
}

export function CasesView({ onNavigate, onSelectCaso, onSelectEmergencyVisit } : CasesViewProps) {
  const [estado, setEstado] = useState<"all" | "Creado" | "En Proceso" | "Finalizado" | "Cerrado">("Creado");
  const [visita, setVisita] = useState<VisitaEmergencia | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(localStorage.getItem("division"));
  const [canChancheDiv, setCanChangeDiv] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [casos, setCasos] = useState<VwDetalleCaso[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const idRol = localStorage.getItem("rol");

  useEffect(() => {
    if(selectedDivision === "null" || selectedDivision === "0") {
      setSelectedDivision("1");
      setCanChangeDiv(true);
    } else {
      setSelectedDivision(selectedDivision);
    }
  }, [selectedDivision])

  const fetchCasos = async () => {
    try {
      if(selectedDivision !== "null") {
        const data = await getCasosByDivision(Number(selectedDivision));
        setCasos(data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    fetchCasos();

    const intervalId = setInterval(fetchCasos, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedDivision]);

  const filteredCasos = casos.filter(caso => {
    const matchesStatus = estado === "all" || caso.estado === estado;
  
    const matchesSearch = searchQuery === "" || 
      caso.tienda_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caso.impacto.toString().includes(searchQuery.toLowerCase()) ||
      caso.urgencia.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caso.correlativo.toString().includes(searchQuery.toLowerCase());
  
    return matchesStatus && matchesSearch;
  });

  const handleSelectCaso = async (caso: VwDetalleCaso) => {
    try {
      setLoading(true);
      const rolesCierre = ["8", "10", "11", "13"]

      const visita = await getVisitasEmergenciaByCaso(caso.id_caso);
      if (visita) {
        onSelectEmergencyVisit(visita);
        
        if(["Finalizado", "Cerrado"].includes(caso.estado)  && rolesCierre.includes(idRol || "")) {
          onSelectCaso(caso)
          onNavigate("caso-cierre")
        }
      } else {
        onSelectCaso(caso);
        onNavigate(idRol === "7" ? "agregar" : "caso-detalle");
      }

    } catch (error: any) {
      onSelectCaso(caso);
      onNavigate("agregar");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    const logoBase64 = await fetch("/LOGOPINULITOORIGINAL.png")
      .then((res) => res.blob())
      .then((blob) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      });

    exportCasosExcel(
      filteredCasos.map(c => ({
        correlativo: c.correlativo,
        estado: c.estado,
        urgencia: c.urgencia,
        impacto: c.impacto,
        tienda_nombre: c.tienda_nombre,
        tipo_solicitud: c.tipo_solicitud,
        categoria: c.categoria,
        subcategoria: c.subcategoria,
        createdAt: formatDateTime(c.createdAt),
        mensaje: c.mensaje
      })),
      selectedDivision ?? "N/A",
      estado,
      logoBase64
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Creado":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "En Proceso":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Finalizado":
        return "bg-green-50 text-green-700 border-green-200";
      case "Cerrado":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) {
        return "Fecha no disponible"; 
    }

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    return new Intl.DateTimeFormat("es-GT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const pendingCount = casos.filter(c => c.estado === "Creado").length;
  const inProcessCount = casos.filter(c => c.estado === "En Proceso").length;
  const finishedCount = casos.filter(c => c.estado === "Finalizado").length;
  const closedCount = casos.filter(c => c.estado === "Cerrado").length;

  return (
    <div className="max-w-6xl mx-auto p-10">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h1 className="text-gray-900">Lista de Casos</h1>
            <p className="text-gray-600">Gestiona los casos creados y en proceso</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Total de Casos</p>
            <p className="text-gray-900 text-2xl">{casos.length}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-blue-600 text-sm mb-1">Creados</p>
            <p className="text-blue-700 text-2xl">{pendingCount}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-yellow-200">
            <p className="text-yellow-600 text-sm mb-1">En Proceso</p>
            <p className="text-yellow-700 text-2xl">{inProcessCount}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-green-600 text-sm mb-1">Finalizados</p>
            <p className="text-green-700 text-2xl">{finishedCount}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Cerrados</p>
            <p className="text-gray-700 text-2xl">{closedCount}</p>
          </div>
        </div>
      </div>
      {canChancheDiv && (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedDivision("1")}
            className={`px-5 py-2 rounded-lg transition-all ${
              selectedDivision === "1"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            División 1
          </button>
          <button
            onClick={() => setSelectedDivision("2")}
            className={`px-5 py-2 rounded-lg transition-all ${
              selectedDivision === "2"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            División 2
          </button>
        </div>
      </div>
      )}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">  
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setEstado("all")}
              className={`px-5 py-2 rounded-lg transition-all ${
                estado === "all"
                  ? "bg-gray-400 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos ({casos.length})
            </button>
            <button
              onClick={() => setEstado("Creado")}
              className={`px-5 py-2 rounded-lg transition-all ${
                estado === "Creado"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Creados ({pendingCount})
            </button>
            <button
              onClick={() => setEstado("En Proceso")}
              className={`px-5 py-2 rounded-lg transition-all ${
                estado === "En Proceso"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              En Proceso ({inProcessCount})
            </button>
            <button
              onClick={() => setEstado("Finalizado")}
              className={`px-5 py-2 rounded-lg transition-all ${
                estado === "Finalizado"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Finalizados ({finishedCount})
            </button>
            <button
              onClick={() => setEstado("Cerrado")}
              className={`px-5 py-2 rounded-lg transition-all ${
                estado === "Cerrado"
                  ? "bg-gray-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cerrados ({closedCount})
            </button>
          </div>
          <Button
            onClick={handleExportExcel}
            className="bg-[#fcb900] text-gray-900 hover:bg-[#e5a700] whitespace-nowrap"
            disabled={filteredCasos.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-00 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por tienda, urgencia, impacto o numero de caso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 border-gray-300 focus:border-[#fcb900] focus:ring-[#fcb900] text-gray-900"
          />
        </div>
        {searchQuery && (
          <p className="text-gray-600 text-sm mt-2">
            Se encontraron <span className="text-gray-900">{filteredCasos.length}</span> resultado
            {filteredCasos.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {filteredCasos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay casos con este filtro</p>
          </div>
        ) : (
          filteredCasos.map((casos) => (
            <button
            key={casos.id_caso}
            onClick={() => handleSelectCaso(casos)}
            className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl hover:border-[#fcb900] transition-all duration-300 transform hover:-translate-y-1 text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-900">Caso: {casos.correlativo}</span>
                    <span className={`px-3 py-1 rounded-lg border text-sm ${getStatusColor(casos.estado)}`}>
                      {(casos.estado)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Urgencia</p>
                        <p className="text-gray-900">{casos.urgencia}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Tienda</p>
                        <p className="text-gray-900">{casos.tienda_nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Tipo de Solicitud</p>
                        <p className="text-gray-900">{casos.tipo_solicitud}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Folder className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Categoria</p>
                        <p className="text-gray-900 text-sm">{casos.categoria}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Impacto</p>
                        <p className="text-gray-900">{casos.impacto}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FolderOpen className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Subcategoria</p>
                        <p className="text-gray-900 text-sm">{casos.subcategoria}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Fecha Asignada</p>
                        <p className="text-gray-900 text-sm">{formatDateTime(casos.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <UserIcon className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">Creado Por</p>
                        <p className="text-gray-900 text-sm">{casos.creador}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-500 text-sm mb-1">Mensaje</p>
                    <p className="text-gray-700">{casos.mensaje}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 mt-2" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}