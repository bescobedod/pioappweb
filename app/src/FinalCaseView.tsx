import {
  User,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Calendar,
  MessageSquare,
  Camera,
  CircleX,
  CheckCircle,
  Clock,
  PackagePlus,
  Goal,
  RefreshCcw,
  ImageIcon
} from "lucide-react";
import { VwDetalleCaso } from "./types/Caso";
import { CasoModel } from "./types/Caso";
import { PermisoEstadoModel } from "./types/PermisoEstado";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { cierreReaperturaCaso, getArchivosByCaso, permisoEstado } from "./api/CasoApi";
import { useEffect, useState, useMemo } from "react";
import { Button } from "./ui/button";
import { getVisitasEmergenciaByCaso, getVisitaByVisitaEmergencia, getVisitasReabiertas } from "./api/VisitaApi";
import { VwDetalleVisitaEmergencia } from "./types/VisitaEmergencia";
import { Visita } from "./types/Visita";
import { MapView } from "./MapView";
import { CasoVisitaReabierta } from "./types/VisitaEmergencia";
import { CasoArchivoModel } from "./types/CasoArchivo";

interface FinalCaseDetailProps {
  caso: VwDetalleCaso;
  onBack: () => void;
}

export function FinalCaseDetail({ caso, onBack }: FinalCaseDetailProps) {
  const [updatedCaso, setUpdatedCaso] = useState<CasoModel | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [visitaEmergencia, setVisitaEmergencia] = useState<VwDetalleVisitaEmergencia | null>(null)
  const [visita, setVisita] = useState<Visita | null>(null);
  const [permiso, setPermiso] = useState<PermisoEstadoModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [timeEstimate, setTimeEstimate] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showReopenedModal, setShowReopenedModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [caseImages, setCaseImages] = useState<CasoArchivoModel[]>([]);  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [visitasReabiertas, setVisitasReabiertas] = useState<CasoVisitaReabierta []>([]);
  const [lastGpsLat, setLastGpsLat] = useState<number | null>(
    visitaEmergencia?.last_gps_latitude !== null ? Number(visitaEmergencia?.last_gps_latitude) : null
  );
  const [lastGpsLng, setLastGpsLng] = useState<number | null>(
    visitaEmergencia?.last_gps_longitude !== null ? Number(visitaEmergencia?.last_gps_longitude) : null
  );

  const ultimaReapertura = useMemo(() => {
      if(!visitasReabiertas || visitasReabiertas.length === 0) {
        return null;
      }
  
      return [...visitasReabiertas].sort((a, b) =>
        new Date(b.fecha_reapertura).getTime() -
        new Date(a.fecha_reapertura).getTime()
      )[0];
    }, [visitasReabiertas])

    const fetchVisitaEmergencia = async () => {
      try {
        const data = await getVisitasEmergenciaByCaso(caso.id_caso);
        setVisitaEmergencia(data);
        setLastGpsLat(Number(data?.last_gps_latitude));
        setLastGpsLng(Number(data?.last_gps_longitude));

        const p = await permisoEstado();
        setPermiso(p);

        const imgs = await getArchivosByCaso(caso.id_caso);
        setCaseImages(imgs);
      } catch (err: any) {
        if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
          localStorage.clear();
          setIsAuthenticated(false);
          return;
        }
        setError((err as Error).message);
      }
    }

    const fetchVisita = async () => {
        if(visitaEmergencia) {
            try {
                const data = await getVisitaByVisitaEmergencia(visitaEmergencia.id_visita)
                setVisita(data);

                const visitasReabiertas = await getVisitasReabiertas(Number(visitaEmergencia?.id_visita), caso.id_caso);
                setVisitasReabiertas(visitasReabiertas);
            } catch (err: any) {
                if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                    localStorage.clear();
                    setIsAuthenticated(false);
                    return;
                }
                setError((err as Error).message);
            }
        }
    }

    const handleReset = () => {
        setShowSuccess(false);
        setShowError(false);
    };
    
    useEffect(() => {
        fetchVisitaEmergencia()
    }, [])

    useEffect(() => {
      fetchVisita();
    }, [visitaEmergencia])

    const lastVisitLocation =
      lastGpsLat !== null && lastGpsLng !== null
        ? {
          lat: lastGpsLat,
          lng: lastGpsLng,
          name: "Última visita",
          }
    : null;

    const cierreCaso = async () => {
      const updatedCaso = await cierreReaperturaCaso(caso.id_caso, "4", comments);

      if (!updatedCaso.caso) {
          setErrorMessage(updatedCaso.message || "Error al cerrar el caso");
          setShowError(true);
          return;
      }

      setUpdatedCaso(updatedCaso.caso);
      setShowSuccess(true);
      alert("El cierre del caso se realizó correctamente")
    }

    const reaperturaCaso = async () => {
      const updatedCaso = await cierreReaperturaCaso(caso.id_caso, "2", comments);

      if (!updatedCaso.caso) {
          setErrorMessage(updatedCaso.message || "Error al actualizar el caso");
          setShowError(true);
          return;
      }

      setUpdatedCaso(updatedCaso.caso);
      setShowSuccess(true);
      alert("La reapertura del caso se realizó correctamente")
    }

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "";

        const date = new Date(dateString);

        return date.toLocaleString("es-GT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-50 text-red-700 border-red-200";
      case "in-progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Finalizado":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in-progress":
        return "En Progreso";
      default:
        return status;
    }
  };

  const handleReopen = () => {
    setShowReopenModal(true);
  };

  const handleClose = () => {
    setShowCloseModal(true);
  };

  const isEnProceso = (visitaEmergencia?.fecha_proceso || visitaEmergencia?.updatedAt &&
                      visitaEmergencia?.createdAt) &&
                      new Date(visitaEmergencia.updatedAt) > new Date(visitaEmergencia.createdAt);

  return (
    <div className="max-w-7xl mx-auto py-10">
      <div className="mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a la lista</span>
        </button>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Caso</h1>
                <p className="text-gray-600">{caso.correlativo}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-lg border ${getStatusColor(caso.estado || "")}`}>
              {getStatusText(caso.estado || "")}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-gray-900">Flujo de la Visita</h2>
        </div>
        <div className="relative">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-start gap-0 min-w-max mx-auto justify-center px-4">
              <div className="flex flex-col items-center flex-1 min-w-[120px] sm:min-w-[160px]">
                <div className="relative flex items-center w-full">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#fcb900] border-4 border-white shadow-lg flex items-center justify-center mx-auto relative z-10`}>
                    <PackagePlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {(visitaEmergencia?.fecha_programacion || visitaEmergencia?.updatedAt || visita?.createdAt) && (
                    <div className="absolute left-1/2 top-1/2 w-full h-1 bg-[#fcb900] -translate-y-1/2"></div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-gray-900 text-xs sm:text-sm mb-1">Caso Creado</p>
                  <p className="text-gray-600 text-xs">
                    {formatDateTime(visitaEmergencia?.fecha_programacion.toString())}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-[120px] sm:min-w-[160px]">
                <div className="relative flex items-center w-full">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#fcb900] border-4 border-white shadow-lg flex items-center justify-center mx-auto relative z-10`}>
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {(visitaEmergencia?.fecha_programacion || visitaEmergencia?.updatedAt || visita?.createdAt) && (
                    <div className="absolute left-1/2 top-1/2 w-full h-1 bg-[#fcb900] to-gray-300 -translate-y-1/2"></div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-gray-900 text-xs sm:text-sm mb-1">Asignada</p>
                  <p className="text-gray-600 text-xs">
                    {formatDateTime(visitaEmergencia?.fecha_programacion.toString())}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-[120px] sm:min-w-[160px]">
                <div className="relative flex items-center w-full">
                  {!isEnProceso && (
                  <div className="absolute right-1/2 top-1/2 w-full h-1 bg-gray-300 -translate-y-1/2"></div>
                  )}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto relative z-10 ${
                      isEnProceso ? 'bg-[#fcb900]' : 'bg-gray-200'
                      }`}>
                      <Clock className={`w-5 h-5 sm:w-6 sm:h-6 ${(isEnProceso) ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    {visitaEmergencia?.estado === "Finalizada" && (
                    <div className={`absolute left-1/2 top-1/2 w-full h-1 -translate-y-1/2 bg-[#fcb900]`}></div>
                    )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-xs sm:text-sm mb-1 ${isEnProceso ? 'text-gray-900' : 'text-gray-500'}`}>
                    En Proceso
                  </p>
                  {isEnProceso ? (
                    <p className="text-gray-600 text-xs">
                      {formatDateTime(visitaEmergencia.fecha_proceso?.toString() || visitaEmergencia?.updatedAt.toString())}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs">Pendiente</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-[120px] sm:min-w-[160px]">
                <div className="relative flex items-center w-full">
                  {(!visita?.createdAt || visitaEmergencia?.estado !== "Finalizada") && (
                  <div className="absolute right-1/2 top-1/2 w-full h-1 bg-gray-300 -translate-y-1/2"></div>
                  )}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto relative z-10 ${
                    (visita?.createdAt && visitaEmergencia?.estado === "Finalizada") ? 'bg-[#fcb900]' : 'bg-gray-200'
                  }`}>
                    <CheckCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${(visita?.createdAt && visitaEmergencia?.estado === "Finalizada") ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                    {(caso?.estado === "Cerrado") && (
                    <div className={`absolute left-1/2 top-1/2 w-full h-1 -translate-y-1/2 bg-[#fcb900]`}></div>
                    )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-xs sm:text-sm mb-1 ${(visita?.createdAt && visitaEmergencia?.estado === "Finalizada") ? 'text-gray-900' : 'text-gray-500'}`}>
                    Finalizada
                  </p>
                  {(visita?.createdAt && visitaEmergencia?.estado === "Finalizada") ? (
                    <p className="text-gray-600 text-xs">
                      {formatDateTime(visita?.createdAt)}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs">Pendiente</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center flex-1 min-w-[120px] sm:min-w-[160px]">
                <div className="relative flex items-center w-full">
                  {(caso?.estado !== "Cerrado") && (
                  <div className="absolute right-1/2 top-1/2 w-full h-1 bg-gray-300 -translate-y-1/2"></div>
                  )}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto relative z-10 ${
                      (caso?.estado === "Cerrado") ? 'bg-[#fcb900]' : 'bg-gray-200'
                      }`}>
                      <Goal className={`w-5 h-5 sm:w-6 sm:h-6 ${(caso?.estado === "Cerrado") ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-xs sm:text-sm mb-1 ${(caso?.estado === "Cerrado") ? 'text-gray-900' : 'text-gray-500'}`}>
                    Caso Cerrado
                  </p>
                  {(caso?.estado === "Cerrado") ? (
                    <p className="text-gray-600 text-xs">
                      {formatDateTime(caso?.updatedAt.toString())}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs">Pendiente</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="grid transition-all duration-700 ease-in-out grid-cols-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">Detalles de la Visita</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Supervisor</p>
                    <p className="text-gray-900">{visitaEmergencia?.nombre_user_asignado}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Tienda</p>
                    <p className="text-gray-900">{visita?.tienda_nombre}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-600 text-sm mb-1">Objetivo de la Visita</p>
                    <p className="text-blue-900">{visitaEmergencia?.comentario}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-600 text-sm mb-1">Mensaje del supervisor</p>
                    <p className="text-blue-900">{visita?.comentario ?? "Supervisor no asigna comentario a la visita"}</p>
                  </div>
                </div>
              </div>
              {visita && ultimaReapertura && (
                <div className="bg-orange-50 rounded-xl p-3 sm:p-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-orange-600 text-xs sm:text-sm">Motivo de la reapertura</p>
                        {visitasReabiertas.length >= 2 && (
                          <button
                          onClick={() => setShowReopenedModal(true)}
                          className="group relative flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg animate-pulse-soft"
                          title="Ver información de reaperturas"
                          >
                            <RefreshCcw className="w-3.5 h-3.5 text-white" />
                            <span className="text-white text-xs font-medium">{visitasReabiertas.length}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-orange-900 text-sm sm:text-base">{ultimaReapertura.motivo_reapertura}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Camera className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-600 text-sm mb-1">Imagen</p>
                    <button 
                      onClick={() => {setShowImageModal(true); setSelectedImage(visita?.url_image.toString() || null)}}
                      className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      title="Click para ver en grande"
                    >
                      <img src={visita?.url_image} alt="Visita de Emergencia" />
                    </button>
                  </div>
                </div>
              </div>
              
              {caseImages && caseImages.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-purple-600 text-xs sm:text-sm mb-3">Imagen Adjunta por el Creador</p>
                      <div className={`grid gap-2 ${
                        caseImages.length === 1 ? 'grid-cols-1' :
                        caseImages.length === 2 ? 'grid-cols-2' :
                        'grid-cols-2 sm:grid-cols-3'
                      }`}>
                        {caseImages.map((image, index) => (
                          <div 
                            key={index}
                            className="relative bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-purple-100"
                            onClick={() => {
                              setSelectedImage(image.presignedUrl);
                              setShowImageModal(true);
                            }}
                          >
                            <div className="aspect-square flex items-center justify-center bg-gray-50">
                              <img
                                src={image.presignedUrl}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded">
                              {index + 1}/{caseImages!.length}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {caso.estado === "Cerrado" && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-purple-600 text-sm mb-1">Mensaje de cierre</p>
                    <p className="text-purple-900">{caso?.mensaje_cierre}</p>
                  </div>
                </div>
              </div>
              )}
              <div className="bg-gray-100 rounded-xl p-3 border border-gray-300">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-gray-600 mr-2" />
                  <p className="text-gray-700">Visita Finalizada</p>
                </div>
              </div>
              {permiso?.puede_modificar === true && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                <Button
                onClick={() => handleClose()}
                disabled={caso.estado === "Cerrado"}
                className="border border-[#33CCFF] flex-1 bg-[#33CCFF] hover:text-[#33CCFF] text-gray-900 hover:bg-white h-10 sm:h-12 text-sm sm:text-base"
                >
                  Cerrar Caso
                </Button>
                <Button
                onClick={() => handleReopen()}
                className="flex-1 bg-[#fcb900] text-gray-900 border border-[#fcb900] hover:bg-gray-100 hover:text-[#fcb900] h-10 sm:h-12 text-sm sm:text-base"
                >
                <CheckCircle className="w-4 h-4 mr-2" />
                  Reabrir Caso
                </Button>
              </div>   
              )}         
            </div>
              {showError && (
                <div
                  className={`absolute top-0 left-0 w-full bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-700 ease-in-out ${
                  showError ? "translate-x-0 opacity-100" : "translate-x-[500px] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-3">
                      <CircleX className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-gray-900 mb-2 text-center">Error al Reabrir Caso!</h2>
                    <p className="text-gray-600 text-center mb-2">La reapertura del caso no se pudo realizar correctamente</p>
                    <div className="w-full space-y-4 mb-8">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <p className="text-gray-500 text-sm mb-1">Detalles</p>
                        <p className="text-gray-800">{errorMessage}</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleReset}
                      className="bg-gray-900 text-white hover:bg-gray-800 w-full"
                    >
                      Regresar
                    </Button>
                  </div>
              </div>
              )}
          </div>
        </div>
        {visitaEmergencia && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:top-4">
            <h2 className="text-gray-900 mb-4 text-center">Ubicaciones</h2>
              <div className="h-[600px]">
                <MapView
                  lastVisit={lastVisitLocation}
                  newVisit={{
                    lat: Number(visitaEmergencia?.new_gps_latitude),
                    lng: Number(visitaEmergencia?.new_gps_longitude),
                    name: "Destino",
                  }}
                  onTimeCalculated={(eta) => setTimeEstimate(eta)}
                />
              </div>
          </div>
        )}
      </div>
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-gray-900">
              Cerrar Caso
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              ¿Estás seguro de Cerrar este caso?
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-3">
              
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-gray-500 text-xs mb-1">Comentario</p>
                  <textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Escribe un comentario para el cierre del caso..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fcb900] focus:border-transparent resize-none text-gray-900"
                    rows={3}
                  />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowCloseModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    cierreCaso();
                    onBack();
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showReopenedModal} onOpenChange={setShowReopenedModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse-soft">
                <RefreshCcw className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-gray-900">
              Historial de Reaperturas
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Visita {visitaEmergencia?.id_visita} - {visitasReabiertas.length} {visitasReabiertas.length === 1 ? 'reapertura' : 'reaperturas'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-orange-900 text-sm font-medium mb-1">
                    Esta visita requiere atención especial
                  </p>
                  <p className="text-orange-700 text-xs">
                    Las múltiples reaperturas pueden indicar problemas recurrentes que necesitan resolución definitiva.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                Historial de Reaperturas
              </h4>
              
              {visitasReabiertas && visitasReabiertas.length > 0 ? (
                <div className="space-y-3">
                  {visitasReabiertas.map((entry, idx) => (
                    <div 
                      key={idx}
                      className="relative bg-white rounded-xl p-4 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="absolute -left-3 top-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-xs font-bold">{visitasReabiertas.length - idx}</span>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <p className="text-gray-900 font-medium text-sm">
                            {(() => {
                              const date = new Date(entry.fecha_reapertura);
                              return isNaN(date.getTime())
                                ? "Fecha inválida"
                                : new Intl.DateTimeFormat("es-GT", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }).format(date);
                            })()}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Motivo de Reapertura</p>
                          <p className="text-gray-700 text-sm">{entry.motivo_reapertura}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
                  <p className="text-gray-500 text-sm">No hay historial de reaperturas disponible</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setShowReopenedModal(false)}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showReopenModal} onOpenChange={setShowReopenModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-gray-900">
              Reabrir Caso
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              ¿Estás seguro de reabrir este caso?
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-gray-500 text-xs mb-1">Motivo de reapertura</p>
                  <textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Describe el motivo por el que se reabrirá el caso..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fcb900] focus:border-transparent resize-none text-gray-900"
                    rows={3}
                  />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowReopenModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    reaperturaCaso();
                    onBack();
                  }}
                >
                  Reabrir
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-4xl p-0 bg-black border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Evidencia Fotográfica</DialogTitle>
            <DialogDescription>
              Imagen ampliada de la evidencia fotográfica de la visita {visita?.id_visita}
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar imagen"
          >
          </button>
          <div className="flex items-center justify-center p-4 sm:p-6 min-h-[300px]">
            <img
              src={selectedImage?.toString()}
              alt="Visita de Emergencia"
              className="
                max-w-full
                max-h-[80vh]
                object-contain
                rounded-lg
              "
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}