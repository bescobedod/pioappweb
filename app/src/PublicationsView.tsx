import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Edit, EyeOff, Eye, FileText, Image, Video, FileIcon, FolderOpen, BarChart3, Power, AlertCircle } from "lucide-react";
import { CreatePublicationModal } from "./CreatePublicationModal";
import { EditPublicationModal } from "./EditPublicationModal";
import { PublicationDetailModal } from "./PublicationDetailModal";
import { ManageCategoriesModal } from "./ManageCategoriesModal";
import { PublicationInsightsModal } from "./PublicationInsightsModal";
import { CategoriaPublicacion, DetallePublicacion } from "./types/Publicacion";
import { getCategoriasPublicacion, getAllPublicaciones, togglePublicationById } from "./api/PublicacionApi";
import { getAllRoles } from "./api/UserApi";

export interface MediaFile {
  id: string;
  name: string;
  type: "image" | "pdf" | "video";
  url_archivo: string;
  size?: number;
  raw?: File;
}

export function PublicationsView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<DetallePublicacion | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showInactiveCategories, setShowInactiveCategories] = useState(false);
  const [showInactivePublications, setShowInactivePublications] = useState(false);
  const [categories, setCategories] = useState<CategoriaPublicacion[]>([]);
  const [publications, setPublications] = useState<DetallePublicacion[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const rol = localStorage.getItem("rol");

  const fetchCategorias = async () => {
    try {
      const categoriasData = await getCategoriasPublicacion();
      setCategories(categoriasData);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  const fetchPublicaciones = async () => {
    try {
      const publicacionesData = await getAllPublicaciones();
      setPublications(publicacionesData);
    }
    catch (error) {
      console.error("Error al obtener publicaciones:", error);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
    try {
      const rolesData = await getAllRoles(); 
      setRoles(rolesData);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };
    fetchCategorias();
    fetchPublicaciones();
    fetchRoles();
  }, []);

  const handleEditPublication = async () => {
    await fetchPublicaciones(); 
    setIsEditModalOpen(false);
    setSelectedPublication(null);
  };

  const visibleCategories = categories.filter(cat => 
    cat.estado === !showInactiveCategories
  );

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) {
        return "Fecha no disponible"; 
    }

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    return new Intl.DateTimeFormat("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const filteredPublications = publications.filter(p => {

    const categoryOfPublication = categories.find(
      c => c.id_categoria_publicacion === Number(p.id_categoria_publicacion)
    );

    const matchesTab = activeTab === "all" || String(p.id_categoria_publicacion) === String(activeTab);

    if (showInactiveCategories) {
      return matchesTab && categoryOfPublication?.estado === false;
    }
  
    const isCategoryActive = categoryOfPublication?.estado !== false;
    const matchesStatus = isCategoryActive && (p.publicacion_estado === !showInactivePublications);

    return matchesTab && matchesStatus;
  });

  const handleCreatePublication = async () => {
    await fetchPublicaciones(); 
    setIsCreateModalOpen(false);
  };

  const handletogglePublication = (id: number) => {
    if (confirm("¿Estás seguro de cambiar el estado de esta publicación?")) {
      togglePublicationById(id)
        .then(() => {
          setPublications(prevPublications =>
            prevPublications.map(p =>
              p.id_publicacion === id
                ? { ...p, publicacion_estado: !p.publicacion_estado, updated_at: new Date().toString() }
                : p            )
          );
          alert("Publicación actualizada exitosamente");
        })
        .catch(error => {
          console.error("Error al actualizar publicación:", error);
          alert("Error al actualizar publicación. Por favor, intenta nuevamente.");
        });
    }
  };

  const handleOpenEdit = (publication: DetallePublicacion) => {
    setSelectedPublication(publication);
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = (publication: DetallePublicacion) => {
    setSelectedPublication(publication);
    setIsDetailModalOpen(true);
  };

  const handleOpenInsights = (publication: DetallePublicacion) => {
    setSelectedPublication(publication);
    setIsInsightsModalOpen(true);
  };

  const handleToggleActive = (publicationId: number) => {
    setPublications(publications.map(p =>
      p.id_publicacion === publicationId
        ? { ...p, publicacion_estado: !p.publicacion_estado, updated_at: new Date().toString() }
        : p
    ));
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id_categoria_publicacion === categoryId)?.nombre || "Sin categoría";
  };

  const getCategoryColor = (categoryId: number) => {
    return categories.find(c => c.id_categoria_publicacion === categoryId)?.color || "#fcb900";
  };

  const getMediaIcon = (type: string | null) => {
    switch (type) {
      case "image": return <Image className="w-3.5 h-3.5 text-blue-500" />;
      case "pdf": return <FileText className="w-3.5 h-3.5 text-red-500" />;
      case "video": return <Video className="w-3.5 h-3.5 text-purple-500" />;
      default: return <FileIcon className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  useEffect(() => {
    if (showInactiveCategories) {
      setShowInactivePublications(true);
    }
  }, [showInactiveCategories]);

useEffect(() => {
  const interval = setInterval(() => {
    fetchPublicaciones();
  }, 5000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
  if (activeTab !== "all") {
    const exists = visibleCategories.some(cat => cat.id_categoria_publicacion.toString() === activeTab);
    if (!exists) setActiveTab("all");
  }
}, [visibleCategories, activeTab]);

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-gray-900 mb-2">Publicaciones</h1>
          <p className="text-gray-600">Gestiona anuncios, capacitaciones y comunicados</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setIsCategoriesModalOpen(true)}
            variant="outline"
            className="flex-1 sm:flex-none border-gray-300 hover:border-[#fcb900] bg-white"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Categorías
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 sm:flex-none bg-gradient-to-r from-[#fcb900] to-[#e5a700] hover:from-[#e5a700] hover:to-[#d19600] text-gray-900"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Publicación
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-3 border-t md:border-t-0 border-gray-200 ml-0 md:ml-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={showInactiveCategories}
            onChange={() => setShowInactiveCategories(prev => !prev)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fcb900]"></div>
          <span className="ml-3 text-sm font-medium text-gray-600 whitespace-nowrap">
            Ver categorías inactivas
          </span>
        </label>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto bg-white border border-gray-200 p-2 rounded-xl">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-[#fcb900] text-gray-900"
          >
            Todas
          </TabsTrigger>
          {visibleCategories.map(category => (
            <TabsTrigger 
              key={category.id_categoria_publicacion} 
              value={category.id_categoria_publicacion.toString()}
              className="data-[state=active]:bg-[#fcb900] text-gray-900"
            >
              {category.nombre}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex items-center pt-4 space-x-3 border-t md:border-t-0 border-gray-200 ml-0 md:ml-4">
          <label 
            htmlFor="show-inactive-publications" 
            className={`relative inline-flex items-center ${showInactiveCategories ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
          >
            <input 
              type="checkbox" 
              id="show-inactive-publications"
              className="sr-only peer"
              checked={showInactivePublications}
              onChange={() => setShowInactivePublications(!showInactivePublications)}
              disabled={showInactiveCategories} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fcb900]"></div>
            <span className="ml-3 text-sm font-medium text-gray-600 whitespace-nowrap">
              Ver publicaciones inactivas
            </span>
          </label>
        </div>
        <TabsContent value={activeTab} className="mt-6">
          {filteredPublications.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-gray-300">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2 font-medium">
                {showInactivePublications ? "No hay publicaciones inactivas" : "No hay publicaciones activas"}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === "all" 
                  ? "Parece que no hay elementos que coincidan con los filtros actuales." 
                  : `No hay elementos en la categoría seleccionada con este estado.`}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublications.map(publication => (
                <Card 
                  key={publication.id_publicacion} 
                  className="overflow-hidden hover:shadow-xl transition-shadow border-2 border-gray-200 hover:border-[#fcb900]/50 flex flex-col"
                >
                  <div 
                    className="h-2 w-full flex-shrink-0"
                    style={{ backgroundColor: getCategoryColor(Number(publication.id_categoria_publicacion)) }}
                  />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span 
                              className="text-xs font-semibold px-3 py-1 rounded-full"
                              style={{ 
                                backgroundColor: `${getCategoryColor(Number(publication.id_categoria_publicacion))}20`,
                                color: getCategoryColor(Number(publication.id_categoria_publicacion))
                              }}
                            >
                              {getCategoryName(Number(publication.id_categoria_publicacion))}
                            </span>
                            {!publication.publicacion_estado && (
                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-300">
                                Finalizada
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatDateTime(publication.createdAt)}
                          </span>
                        </div>
                        <h3 
                          className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-[#fcb900] transition-colors"
                          onClick={() => handleOpenDetail(publication)}
                        >
                          {publication.titulo}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          por <span className="text-gray-600">{publication.creado_por}</span>
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {publication.mensaje}
                      </p>
                      {publication.archivos && publication.archivos.filter(f => f.id_archivo_pub).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {publication.archivos
                            .filter(file => file.id_archivo_pub !== null)
                            .map(file => (
                              <div 
                                key={file.id_archivo_pub}
                                className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-700 border border-gray-200"
                              >
                                {getMediaIcon(file.tipo as "image" | "pdf" | "video")}
                                <span className="truncate max-w-[120px]" title={file.nombre_archivo || ''}>
                                  {file.nombre_archivo}
                                </span>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 pt-4 mt-4 border-t border-gray-200 flex-shrink-0">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleOpenDetail(publication)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-gray-300 hover:border-[#fcb900] bg-white"
                        >
                          Ver Detalle
                        </Button>
                        {(rol === "12" || rol === "11") && (
                          <Button
                            onClick={() => handleOpenInsights(publication)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-gray-300 hover:border-purple-500 bg-white"
                          >
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Estadísticas
                          </Button>
                        )}
                      </div>
                      {(rol === "12" || rol === "11") && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleOpenEdit(publication)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-gray-300 hover:border-blue-500 bg-white"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handletogglePublication(publication.id_publicacion)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-gray-300 hover:border-red-500 bg-white"
                          >
                            {publication.publicacion_estado ? (
                              <EyeOff className="h-4 w-4 mr-1" />
                            ) : (
                              <Eye className="h-4 w-4 mr-1" />
                            )}
                            {publication.publicacion_estado ? "Inactivar" : "Reactivar"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <CreatePublicationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePublication}
        categories={categories}
        availableRoles={roles}
      />
      {selectedPublication && isEditModalOpen && (
        <>
          <EditPublicationModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPublication(null);
            }}
            onSubmit={handleEditPublication}
            publication={selectedPublication}
            categories={categories}
            availableRoles={roles}
          />
        </>
      )}
      {selectedPublication && isDetailModalOpen && (
        <>
          <PublicationDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedPublication(null);
            }}
            publication={selectedPublication}
            categoryName={getCategoryName(Number(selectedPublication.id_categoria_publicacion))}
            categoryColor={getCategoryColor(Number(selectedPublication.id_categoria_publicacion))}
          />
        </>
      )}
      {selectedPublication && isInsightsModalOpen && (
        <>
          <PublicationInsightsModal
            isOpen={isInsightsModalOpen}
            onClose={() => {
              setIsInsightsModalOpen(false);
              setSelectedPublication(null);
            }}
            publication={selectedPublication}
            categoryName={getCategoryName(Number(selectedPublication.id_categoria_publicacion))}
            categoryColor={getCategoryColor(Number(selectedPublication.id_categoria_publicacion))}
          />
        </>
      )}
      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        onUpdateCategories={setCategories}
        setPublications={setPublications}
      />
    </div>
  );
}