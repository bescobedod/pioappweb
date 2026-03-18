import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { CheckCircle, Clock, Loader2, MapPin, CircleX, ArrowLeft, ImageIcon } from "lucide-react";
import { Supervisor } from "../src/types/Supervisor";
import { Visita } from "../src/types/Visita";
import { TiendaModulo } from "../src/types/TiendaModulo";
import { TipoVisita } from "../src/types/TipoVisita";
import { getAllSupervisors, getSupervisorBycodEmpleado } from "../src/api/SupervisorApi";
import { getTiendaByIdAndEmpresa } from "../src/api/TiendaModuloApi";
import { MapView } from "./MapView";
import {
  getLastVisitaBySupervisor,
  getTiposVisita,
  createVisitaEmergencia,
  getVisitasEmergenciaById
} from "./api/VisitaApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { VisitaEmergencia } from "./types/VisitaEmergencia";
import { VwDetalleCaso } from "./types/Caso";
import { getArchivosByCaso } from "./api/CasoApi";
import { CasoArchivoModel } from "./types/CasoArchivo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

interface DeliveryViewProps {
  caso: VwDetalleCaso | null;
  onBack: () => void;
}

export function DeliveryView({caso, onBack}: DeliveryViewProps) {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [caseImages, setCaseImages] = useState<CasoArchivoModel[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [store, setStore] = useState<TiendaModulo | null>(null)
  const [tiposVisita, setTiposVisita] = useState<TipoVisita[]>([]);
  const [visitas, setVisitas] = useState<Visita | null>(null);
  const [ultimaVisitaValidada, setUltimaVisitaValidada] = useState<boolean>(false);
  const [visitaCreada, setVisitaCreada] = useState<VisitaEmergencia | null>(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<TiendaModulo | null>(null);
  const [selectedPilot, setSelectedPilot] = useState<Supervisor | null>(null);
  const [selectedTipoVisita, setSelectedTipoVisita] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<"waiting" | "confirmed" | "finished" | null>(null);
  const [routeLoaded, setRouteLoaded] = useState(false);
  const [timeEstimate, setTimeEstimate] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState("");
  const [lastGpsLat, setLastGpsLat] = useState<number | null>(null);
  const [lastGpsLng, setLastGpsLng] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canCreate, setCanCreate] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

  const scheduleDays = [
    { id: "1", name: "Hoy" },
    { id: "2", name: "Mañana" },
  ];

  const fetchStoreAndSup = async () => {
    if (!caso?.id_tienda || !caso?.id_empresa) return;

    try {
      const tienda = await getTiendaByIdAndEmpresa(caso.id_tienda, caso.id_empresa);
      setStore(tienda);

      const sup = await getSupervisorBycodEmpleado(tienda?.codigo_administrador || "0");
      setSelectedPilot(sup);

      setComments(caso.mensaje)
      const imgs = await getArchivosByCaso(caso.id_caso);
      setCaseImages(imgs);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchStoreAndSup();
  }, [caso])

  useEffect(() => {
    setSelectedStore(store);
  }, [store])

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const data = await getAllSupervisors();
        setSupervisors(data);
      } catch (err: any) {
        if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
          localStorage.clear();
          setIsAuthenticated(false);
          return;
        }
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchSupervisors();
    const fecthTiposVisita = async () => {
      try {
        const tiposData = await getTiposVisita();
        setTiposVisita(tiposData);
      } catch (err) {
        setError((err as Error).message);
      }
    }
    fecthTiposVisita();
  }, []);

  useEffect(() => {
    if(selectedPilot) {
      getLastVisita();
    }else {
      setVisitas(null);
      setUltimaVisitaValidada(false)
    }
  }, [selectedPilot]);

  useEffect(() => {
    if (!visitas && ultimaVisitaValidada) {
      setRouteLoaded(true);
    }
  }, [visitas, ultimaVisitaValidada]);

  const handleReset = () => {
    setShowSuccess(false);
    setShowError(false);
    setSelectedPilot(null);
    setSelectedStore(null);
    setSelectedTipoVisita("");
    setConfirmationStatus(null);
    setComments("");
    setCanCreate(true);
  };

  const getTipoVisitaName = () => {
    const tipo = tiposVisita.find((t) => t.id_tipo_visita === Number(selectedTipoVisita));
    return tipo ? tipo.name : "";
  }

  const getScheduleDayName = () => scheduleDays.find(d => d.id === selectedScheduleDay)?.name || "";

  const getLastVisita = async () => {
    if (!selectedPilot) return;

    try {
      const data = await getLastVisitaBySupervisor(selectedPilot.codsupervisor);
      setVisitas(data);
      setUltimaVisitaValidada(true);

      if (data?.gps_latitud_visita && data?.gps_longitud_visita && selectedScheduleDay === "1") {
        setLastGpsLat(Number(data.gps_latitud_visita));
        setLastGpsLng(Number(data.gps_longitud_visita));
      } else {
        setLastGpsLat(null);
        setLastGpsLng(null);
      }
      
    } catch (err: any) {
      if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
        localStorage.clear();
        setIsAuthenticated(false);
        return;
      }
      console.error("Error al obtener visitas:", err);
    } finally {
      setLoading(false);
    }
  };

  const createVisita = async () => {
    setCanCreate(false);
    const fecha = new Date();
    if(selectedScheduleDay === "2") {
      fecha.setDate(fecha.getDate() + 1);
      fecha.setHours(8, 0, 0, 0);
    }
    if(selectedPilot && selectedStore && (selectedScheduleDay === "2" || selectedScheduleDay === "1" && routeLoaded)) {
      const visitaEmergencia = await createVisitaEmergencia({
        empresa: selectedStore.codigo_empresa,
        tienda: selectedStore.codigo_tienda,
        tienda_nombre: selectedStore.nombre_tienda,
        tienda_direccion: selectedStore?.direccion_tienda || "Sin direccion establecida",
        id_tipo_visita: Number(selectedTipoVisita),
        last_gps_latitude: visitas?.gps_latitud_visita.toString() || null,
        last_gps_longitude: visitas?.gps_longitud_visita.toString() || null,
        new_gps_latitude: selectedStore.altitud.toString(),
        new_gps_longitude: selectedStore.latitud.toString(),
        comentario: comments,
        id_estado: 1,
        fecha_programacion: fecha,
        user_asignado: selectedPilot.codsupervisor,
        nombre_user_asignado: selectedPilot.nomsupervisor,
        id_caso: caso?.id_caso || "",
        division: Number(selectedStore.division)
      })

      if (visitaEmergencia.message) {
        setErrorMessage(visitaEmergencia.message);
        setShowError(true);
        return
      }
      else{
        setVisitaCreada(visitaEmergencia.nuevaVisita);
        setShowSuccess(true);
        const visitaCreada = await getVisitasEmergenciaById(visitaEmergencia.nuevaVisita.id_visita);
      }
    } else {
      console.warn("Hacen falta parámetros para asignar una visita de emergencia");
    }
  }

  useEffect(() => {
    if (!visitaCreada?.id_visita) return;

    const visitaId = visitaCreada.id_visita.toString();

    const interval = setInterval(async () => {
      const updated = await getVisitasEmergenciaById(visitaId);
        if (!updated) return;

        setVisitaCreada(updated);

        if (updated.last_gps_latitude && updated.last_gps_longitude && updated.id_estado === 2) {
          setLastGpsLat(Number(updated.last_gps_latitude));
          setLastGpsLng(Number(updated.last_gps_longitude));
        }

        if (updated.id_estado === 1) setConfirmationStatus("waiting");
        if (updated.id_estado === 2) setConfirmationStatus("confirmed");
        if (updated.id_estado === 3) {
          setConfirmationStatus("finished");
          clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [visitaCreada?.id_visita]);

  useEffect(() => {
    if(visitas && ultimaVisitaValidada && selectedScheduleDay === "1") {
      setLastGpsLat(Number(visitas.gps_latitud_visita));
      setLastGpsLng(Number(visitas.gps_longitud_visita));
    }
    
    if(selectedScheduleDay === "2"){
      setLastGpsLat(null);
      setLastGpsLng(null);
    }
  }, [selectedScheduleDay])

  const showMap =
  selectedPilot &&
  selectedStore &&
  visitas &&
  lastGpsLat !== null &&
  lastGpsLng !== null

  return (
    <div className="py-8 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a la lista</span>
        </button>
        <div className={`grid transition-all duration-700 ease-in-out ${showMap ? 'grid-cols-1 lg:grid-cols-2 gap-8' : 'grid-cols-1 place-items-center'}`}>
          <div className={`w-full transition-all duration-700 ease-in-out ${showMap ? 'max-w-none' : 'max-w-[500px]'}`}>
            <div className="relative">
              <div
                className={`top-0 left-0 w-full bg-white rounded-2xl  border border-gray-200 pr-8 pl-8 pb-8 pt-2 transition-all duration-700 ease-in-out ${
                  showSuccess || showError ? "-translate-x-[500px] opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
                }`}
              >
                <div className="text-center mb-8">
                  <h2 className="text-gray-900 mb-2">Agregar Visita</h2>
                  <p className="text-gray-600">Asigna supervisores a tiendas</p>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-900 mb-2 block">Supervisor</Label>
                      {loading ? (
                        <p className="text-gray-500">Cargando supervisor...</p>
                      ) : error ? (
                        <p className="text-red-500">{error}</p>
                      ) : (
                        <p className="text-gray-900">
                        {selectedPilot ? selectedPilot.nomsupervisor : "No hay supervisor asignado"} </p>
                      )}
                  </div>
                  {visitas && ultimaVisitaValidada && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <Label className="text-gray-600 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-[#fcb900]" />
                          Última Visita
                      </Label>
                      <p className="text-gray-900 text-sm">{visitas.tienda_nombre}</p>
                      <p className="text-gray-500 text-xs mt-1">{visitas.direccion_tienda}</p>
                    </div>
                  )}
                  {!visitas && ultimaVisitaValidada && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <Label className="text-gray-600 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-[#fcb900]" />
                          Última Visita
                      </Label>
                      <p className="text-gray-900 text-sm">Este supervisor aún no ha registrado una visita</p>
                      <p className="text-gray-500 text-xs mt-1">Se tomará en cuenra su ubicación actual cuando el supervisor confirme visita</p>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="pilot" className="text-gray-900 mb-2 block">Tienda</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Tiendas...</p>
                    ) : storesError ? (
                      <p className="text-red-500">{storesError}</p>
                    ) : ( 
                      <p className="text-gray-900">{selectedStore?.nombre_tienda}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="scheduleDay" className="text-gray-900 mb-2 block">Programar para</Label>
                    <Select value={selectedScheduleDay} onValueChange={setSelectedScheduleDay}>
                        <SelectTrigger id="dia" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar día" />
                        </SelectTrigger>
                        <SelectContent>
                          {scheduleDays.map((sd) => (
                            <SelectItem key={sd.id} value={sd.id.toString()} className="cursor-pointer">
                              {sd.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                  <div>
                    <Label htmlFor="pilot" className="text-gray-900 mb-2 block">Tipo de Visita</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Tipos de Visita...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      <Select value={selectedTipoVisita} onValueChange={setSelectedTipoVisita}>
                        <SelectTrigger id="tipo_visita" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar Tipo de Visita" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposVisita.map((tp) => (
                            <SelectItem key={tp.id_tipo_visita} value={tp.id_tipo_visita.toString()} className="cursor-pointer">
                              {tp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="comments" className="text-gray-900 mb-2 block">Comentarios</Label>
                    <textarea
                      id="comments"
                      value={caso?.mensaje}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Describe el objetivo de la visita..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fcb900] focus:border-transparent resize-none text-gray-900"
                      rows={3}
                    />
                  </div>
                  
              {caseImages && caseImages.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-purple-600 text-xs sm:text-sm mb-3">Imágenes Adjuntas por el Creador</p>
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
                  <Button
                    onClick={createVisita}
                    className="bg-[#fcb900] text-gray-900 hover:bg-[#e5a700] w-full mt-2"
                    disabled={!canCreate || !selectedPilot || !selectedStore || !selectedTipoVisita || (selectedScheduleDay === "1" && !routeLoaded)}
                  >
                    Agregar Visita
                  </Button>
                </div>
              </div>
              {visitaCreada && (
                <div
                  className={`absolute top-0 left-0 w-full bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-700 ease-in-out ${
                  showSuccess ? "translate-x-0 opacity-100" : "translate-x-[500px] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-gray-900 mb-2 text-center">¡Visita Asignada!</h2>
                    <p className="text-gray-600 text-center mb-2">La asignación se realizó correctamente</p>
                    <div className="w-full space-y-4 mb-8">
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Supervisor</p>
                        <p className="text-gray-800">{visitaCreada.nombre_user_asignado}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Tienda</p>
                        <p className="text-gray-800">{visitaCreada.tienda_nombre}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Tipo de Visita</p>
                        <p className="text-gray-800">{getTipoVisitaName()}</p>
                      </div>
                      {comments && (
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <p className="text-gray-500 text-sm mb-1">Comentarios</p>
                          <p className="text-gray-800">{visitaCreada.comentario}</p>
                        </div>
                        
                      )}
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <p className="text-gray-500 text-sm mb-1">Programada para</p>
                        <p className="text-gray-800">{getScheduleDayName()}</p>
                      </div>
                      {confirmationStatus === "waiting" && (
                        <div className="bg-gray-100 rounded-xl p-3 border border-gray-300">
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-gray-600 mr-2 animate-spin" />
                            <p className="text-gray-700">En espera de confirmación</p>
                          </div>
                        </div>
                      )}
                      {confirmationStatus === "confirmed" && (
                        <>
                          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                            <div className="flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                              <p className="text-green-700">Supervisor confirma visita</p>
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-xl p-2 border border-yellow-600">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Clock className="w-5 h-5 text-gray-900 mr-3" />
                                <p className="text-gray-900">Hora estimada de llegada</p>
                              </div>
                              <p className="text-gray-900">{timeEstimate}</p>
                            </div>
                          </div>
                        </>
                      )}
                      {confirmationStatus === "finished" && (
                        <>
                          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                            <div className="flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                              <p className="text-green-700">Supervisor ha finalizado la visita</p>
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-xl p-2 border border-yellow-600">
                            <div className="flex items-center justify-between">
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
              </div>
              )}
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
                    <h2 className="text-gray-900 mb-2 text-center">Error al Asignar Visita!</h2>
                    <p className="text-gray-600 text-center mb-2">La asignación no se pudo realizar correctamente</p>
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
                      Nueva Asignación
                    </Button>
                  </div>
              </div>
              )}
            </div>
          </div>
          {showMap && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 lg:sticky lg:top-4">
                <h3 className="text-gray-900 mb-4 text-center">Ubicaciones</h3>
                <div className="h-[500px]">
                  <MapView
                    newVisit={{
                      lat: selectedStore.altitud,
                      lng: selectedStore.latitud,
                      name: selectedStore.nombre_tienda,
                      direction: selectedStore.direccion_tienda
                    }}
                    lastVisit={{
                      lat: lastGpsLat,
                      lng: lastGpsLng,
                      name: visitas.tienda_nombre,
                      direction: visitas.direccion_tienda}}
                    onRouteLoaded={() => setRouteLoaded(true)}
                    onTimeCalculated={(eta) => setTimeEstimate(eta)}  
                  />
                </div>
              </div>
            )}
        </div>
      </div>
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-4xl p-0 bg-black border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Evidencia Fotográfica</DialogTitle>
            <DialogDescription>
              Imagen ampliada de la evidencia fotográfica del caso
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