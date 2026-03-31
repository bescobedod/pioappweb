import { CircleX, CheckCircle, ArrowLeft } from "lucide-react";
import { VwDetalleCaso } from "./types/Caso";
import { CasoModel } from "./types/Caso";
import { TiendaModulo } from "./types/TiendaModulo";
import { TipoSolicitud } from "./types/TipoSolicitud";
import { Impacto } from "./types/Impacto";
import { Urgencia } from "./types/Urgencia";
import { Categoria } from "./types/Categoria";
import { Subcategoria } from "./types/Subcategoria";
import { getCasoById } from "./api/CasoApi";
import { getAllTiendas } from "./api/TiendaModuloApi";
import {
    getAllTiposSolicitud,
    getAllCategorias,
    getAllImpactos,
    getAllUrgencias,
    getSubcategoriaByCategoria,
    updateCaso
} from "./api/CasoApi";
import { useEffect, useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Combobox } from "./ui/combobox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Button } from "./ui/button";
import { useAuth } from "./api/context/AuthContext";

interface CaseDetailProps {
  caso: VwDetalleCaso;
  onBack: () => void;
}

export function CaseDetail({ caso, onBack }: CaseDetailProps) {
    const [selectedCaso, setSelectedCaso] = useState<CasoModel | null>(null)
    const [updatedCaso, setUpdatedCaso] = useState<CasoModel | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [stores, setStores] = useState<TiendaModulo[]>([]);
    const [tiposSolicitud, setTiposSolicitud] = useState<TipoSolicitud[]>([]);
    const [impactos, setImpactos] = useState<Impacto[]>([]);
    const [urgencias, setUrgencias] = useState<Urgencia[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
    const [selectedTipoSolicitud, setSelectedTipoSolicitud] = useState("");
    const [selectedImpacto, setSelectedImpacto] = useState("");
    const [selectedUrgencia, setSelectedUrgencia] = useState("");
    const [selectedCategoria, setSelectedCategoria] = useState("");
    const [selectedSubcategoria, setSelectedSubcategoria] = useState("");
    const [selectedStore, setSelectedStore] = useState<TiendaModulo | null>(null);
    const [comments, setComments] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const { user } = useAuth();
    const idRol = localStorage.getItem("rol");
    const canEdit = idRol === "8" || idRol === "13";

    const fetchCases = async () => {
            try {
                const data = await getCasoById(caso.id_caso);
                setSelectedCaso(data);
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
    
    useEffect(() => {
        fetchCases()
    }, [])

    useEffect(() => {
        if (!selectedCaso || stores.length === 0) return;

        const tienda = stores.find(
            (t) => t.codigo_tienda === selectedCaso.id_tienda && t.codigo_empresa === selectedCaso.id_empresa
        );

        setSelectedStore(tienda ?? null);
        setSelectedTipoSolicitud(selectedCaso.id_tipo_solicitud.toString());
        setSelectedImpacto(selectedCaso.id_impacto.toString());
        setSelectedUrgencia(selectedCaso.id_urgencia.toString());
        setSelectedCategoria(selectedCaso.id_categoria.toString());
        setSelectedSubcategoria(selectedCaso.id_subcategoria.toString());
        setComments(selectedCaso.mensaje ?? "");
    }, [selectedCaso, stores]);


    //OBTENER TIENDAS
    const fetchStores = async () => {
        try {
            const data = await getAllTiendas('0');
            setStores(data);
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

    //OBTENER TIPOS DE SOLICITUD
    const fecthTiposSolicitud = async () => {
        try {
            const data = await getAllTiposSolicitud();
            setTiposSolicitud(data);
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
    }

    //OBTENER IMPACTO
    const fecthImpacto = async () => {
        try {
            const data = await getAllImpactos();
            setImpactos(data);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        } finally {
            setLoading(false)
        }
    }

    //OBTENER URGENCIA
    const fecthUrgencia = async () => {
        try {
            const data = await getAllUrgencias();
            setUrgencias(data);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        } finally {
            setLoading(false)
        }
    }

    //OBTENER CATEGORIAS
    const fecthCategoria = async () => {
        try {
            const data = await getAllCategorias();
            setCategorias(data);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        } finally {
            setLoading(false)
        }
    }

    //OBTENER SUBCATEGORIAS
    const fecthSubcategoria = async () => {
        try {
            const data = await getSubcategoriaByCategoria(Number(selectedCategoria));
            setSubcategorias(data);
        } catch (err: any) {
            if (['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REQUIRED'].includes(err?.message)) {
                localStorage.clear();
                setIsAuthenticated(false);
                return;
            }
            setError((err as Error).message);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStores();
        fecthTiposSolicitud();
        fecthImpacto();
        fecthUrgencia();
        fecthCategoria();
    }, []);

    useEffect(() => {
        fecthSubcategoria();
    }, [selectedCategoria])

    const handleReset = () => {
        setShowSuccess(false);
        setShowError(false);
    };

    const updateSelectedCaso = async () => {
        const fecha = new Date();
        if(selectedStore && selectedTipoSolicitud && selectedImpacto && selectedUrgencia && selectedCategoria && selectedSubcategoria) {
            const updatedCaso = await updateCaso(caso.id_caso, {
                id_tienda: selectedStore?.codigo_tienda,
                tienda_nombre: selectedStore?.nombre_tienda,
                id_empresa: selectedStore?.codigo_empresa,
                division: selectedStore?.division,
                id_tipo_solicitud: Number(selectedTipoSolicitud),
                id_impacto: Number(selectedImpacto),
                id_urgencia: Number(selectedUrgencia),
                id_categoria: Number(selectedCategoria),
                id_subcategoria: Number(selectedSubcategoria),
                mensaje: comments
            });

            if (!updatedCaso.caso) {
                setErrorMessage(updatedCaso.message || "Error al actualizar el caso");
                setShowError(true);
                return;
            }

            setUpdatedCaso(updatedCaso.caso);
            setShowSuccess(true);
        } else {
            console.warn("Hacen falta parámetros para actualizar el caso");
        }
    }

    const impactoSeleccionado = impactos.find(
        (i) => i.id_impacto.toString() === selectedImpacto
    );

    const urgenciaSeleccionada = urgencias.find(
        (u) => u.id_urgencia.toString() === selectedUrgencia
    );

    const tipoSolicitudSeleccionada = tiposSolicitud.find(
    (t) => t.id_tipo_solicitud.toString() === selectedTipoSolicitud
    );

    const categoriaSeleccionada = categorias.find(
        (c) => c.id_categoria.toString() === selectedCategoria
    );

    const subcategoriaSeleccionada = subcategorias.find(
        (s) => s.id_subcategoria.toString() === selectedSubcategoria
    );

  return (
    <div className="py-10 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a la lista</span>
        </button>
        <div className="grid transition-all duration-700 ease-in-out grid-cols-1 place-items-center">
          <div className="w-full max-w-[500px] transition-all duration-700 ease-in-out">
            <div className="relative">
              <div
                className={`absolute top-0 left-0 w-full bg-white rounded-2xl  border border-gray-200 pr-8 pl-8 pb-8 pt-2 transition-all duration-700 ease-in-out ${
                  showSuccess || showError ? "-translate-x-[500px] opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
                }`}
              >
                <div className="text-center mb-8">
                  <h2 className="text-gray-900 mb-2">Detalles del caso</h2>
                  <p className="text-gray-600">Visualiza la información del caso para el área administrativa y operativa</p>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="pilot" className="text-gray-900 mb-2 block">Tienda</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Tiendas...</p>
                    ) : ( 
                      <Combobox
                        options={stores.map((store) => ({
                          id: store.id_tienda.toString(),
                          name: store.nombre_tienda,
                          empresa: store.codigo_empresa,
                          lat: store.latitud,
                          lng: store.altitud
                        }))}
                        value={selectedStore ? selectedStore.id_tienda.toString() : ""}
                        disabled={!canEdit}
                        onChange={(id) => {
                          const store = stores.find((s) => s.id_tienda.toString() === id);
                          if (store) {
                            setSelectedStore({
                              id_tienda: store.id_tienda,
                              nombre_tienda: store.nombre_tienda,
                              direccion_tienda: store.direccion_tienda,
                              codigo_empresa: store.codigo_empresa,
                              latitud: store.latitud ?? 0,
                              altitud: store.altitud ?? 0,
                              id_departamento: store.id_departamento,
                              nombre_empresa: store.nombre_empresa,
                              codigo_tienda: store.codigo_tienda,
                              division: store.division,
                            });
                          }
                        }}
                        placeholder="Seleccionar tienda"
                        searchPlaceholder="Buscar Tienda"
                        emptyMessage="No se encontró tienda"
                        className="text-gray-900"
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="tipo_solicitud" className="text-gray-900 mb-2 block">Tipo de Solicitud</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando tipos de solicitud...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                        <Select
                        value={selectedTipoSolicitud}
                        onValueChange={setSelectedTipoSolicitud}
                        disabled={!canEdit}
                        >
                          <SelectTrigger id="tipo_solicitud" className="bg-gray-50 border-gray-300 text-gray-900">
                            <SelectValue placeholder="Seleccionar Tipo de Solicitud" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposSolicitud.map((im) => (
                              <SelectItem 
                              key={im.id_tipo_solicitud}
                              value={im.id_tipo_solicitud.toString()}
                              className="cursor-pointer">
                                {im.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="impacto" className="text-gray-900 mb-2 block">Impacto</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Impactos...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      <Select
                      value={selectedImpacto}
                      onValueChange={setSelectedImpacto}
                      disabled={!canEdit}
                      >
                        <SelectTrigger id="impacto" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar Impacto" />
                        </SelectTrigger>
                        <SelectContent>
                          {impactos.map((im) => (
                            <SelectItem 
                            key={im.id_impacto}
                            value={im.id_impacto.toString()}
                            className="cursor-pointer">
                              {im.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="urgencia" className="text-gray-900 mb-2 block">Urgencia</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Urgencias...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      <Select
                      value={selectedUrgencia}
                      onValueChange={setSelectedUrgencia}
                      disabled={!canEdit}
                      >
                        <SelectTrigger id="urgencia" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar Urgencia" />
                        </SelectTrigger>
                        <SelectContent>
                          {urgencias.map((ur) => (
                            <SelectItem 
                            key={ur.id_urgencia}
                            value={ur.id_urgencia.toString()}
                            className="cursor-pointer">
                              {ur.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="categoria" className="text-gray-900 mb-2 block">Categoria</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Categorias...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      <Select
                      value={selectedCategoria}
                      onValueChange={setSelectedCategoria}
                      disabled={!canEdit}
                      >
                        <SelectTrigger id="categoria" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((ur) => (
                            <SelectItem 
                            key={ur.id_categoria}
                            value={ur.id_categoria.toString()}
                            className="cursor-pointer">
                              {ur.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="subcategoria" className="text-gray-900 mb-2 block">Subcategoria</Label>
                    {loading ? (
                      <p className="bg-gray-50 border-gray-300 text-gray-500">Cargando Subcategorias...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : (
                      <Select
                      value={selectedSubcategoria}
                      onValueChange={setSelectedSubcategoria}
                      disabled={!canEdit}
                      >
                        <SelectTrigger id="subcategoria" className="bg-gray-50 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Seleccionar Subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategorias.map((sub) => (
                            <SelectItem 
                            key={sub.id_subcategoria}
                            value={sub.id_subcategoria.toString()}
                            className="cursor-pointer"
                            disabled={!selectedCategoria}>
                              {sub.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="comments" className="text-gray-900 mb-2 block">Mensaje</Label>
                    <textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Describe el objetivo de la visita..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fcb900] focus:border-transparent resize-none text-gray-900"
                      rows={3}
                      disabled={!canEdit}
                    />
                  </div>
                  {canEdit && (
                  <Button
                    onClick={updateSelectedCaso}
                    className="bg-[#fcb900] text-gray-900 hover:bg-[#e5a700] w-full mt-2"
                    disabled={!selectedStore || !selectedTipoSolicitud || !selectedImpacto || !selectedUrgencia || !selectedCategoria || !selectedSubcategoria}
                  >
                    Actualizar Caso
                  </Button>
                  )}
                </div>
              </div>
              
              {updatedCaso && (
                <div
                  className={`absolute top-0 left-0 w-full bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-700 ease-in-out ${
                  showSuccess ? "translate-x-0 opacity-100" : "translate-x-[500px] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-gray-900 mb-2 text-center">¡Caso Modificado!</h2>
                    <p className="text-gray-600 text-center mb-2">El caso se modificó correctamente</p>
                    <div className="w-full space-y-4 mb-8">
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Tienda</p>
                        <p className="text-gray-800">{selectedStore?.nombre_tienda}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Empresa</p>
                        <p className="text-gray-800">{selectedStore?.nombre_empresa}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">División</p>
                        <p className="text-gray-800">{selectedStore?.division}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Impacto</p>
                        <p className="text-gray-800">{impactoSeleccionado?.nombre}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Urgencia</p>
                        <p className="text-gray-800">{urgenciaSeleccionada?.nombre}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Categoría</p>
                        <p className="text-gray-800">{categoriaSeleccionada?.nombre}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <p className="text-gray-300 text-sm mb-1">Subcategoría</p>
                        <p className="text-gray-800">{subcategoriaSeleccionada?.nombre}</p>
                      </div>
                      {comments && (
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <p className="text-gray-500 text-sm mb-1">Mensaje</p>
                          <p className="text-gray-800">{updatedCaso.mensaje}</p>
                        </div>
                      )}
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
                    <h2 className="text-gray-900 mb-2 text-center">Error al Actualizar Caso!</h2>
                    <p className="text-gray-600 text-center mb-2">La actualización del caso no se pudo realizar correctamente</p>
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
        </div>
      </div>
    </div>
  )
}