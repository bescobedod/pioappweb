import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { FileText, Image as ImageIcon, Video, Calendar, Edit3, Eye, Users } from "lucide-react";
import { MediaViewer } from "./MediaViewer";
import { useEffect, useState } from "react";
import { DetallePublicacion, ArchivoMetadata } from "./types/Publicacion";

interface PublicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication: DetallePublicacion;
  categoryName: string;
  categoryColor: string;
}

export function PublicationDetailModal({ 
  isOpen, 
  onClose, 
  publication, 
  categoryName, 
  categoryColor 
}: PublicationDetailModalProps) {
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [archivos, setArchivos] = useState<ArchivoMetadata[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    if(isOpen && publication.archivos) {
      setArchivos(publication.archivos);
    }
  }, [isOpen, publication]);
  
  const getMediaIcon = (type: string | null) => {
    switch (type) {
      case "image": return <ImageIcon className="w-5 h-5" />;
      case "pdf": return <FileText className="w-5 h-5" />;
      case "video": return <Video className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5"/>
    }
  };

  const handleViewMedia = (index: number) => {
    setSelectedMediaIndex(index);
    setIsMediaViewerOpen(true);
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
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if(!open && isMediaViewerOpen) return;
      onClose();
    }}>
      <DialogContent
      className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white"
      onPointerDownOutside={(e) => {
        if(isMediaViewerOpen) {
          e.preventDefault();
        }
      }}
      >
        <DialogHeader>
          <div className="space-y-4">
            <Badge 
              className="w-fit border"
              style={{ 
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
                borderColor: categoryColor
              }}
            >
              {categoryName}
            </Badge>
            <DialogTitle className="text-2xl text-gray-900 leading-tight">
              {publication.titulo}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detalle completo de la publicación con información y archivos adjuntos.
            </DialogDescription>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Creado: {formatDateTime(publication.createdAt)}</span>
              </div>
              {publication.updatedAt && (
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Modificado: {formatDateTime(publication.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
          <div className="flex items-start gap-2">
            <Edit3 className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Creado por</p>
              <p className="text-sm text-gray-900 font-medium">{publication.creado_por}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Roles Asignados</p>
              <div className="flex flex-wrap gap-2">
                {publication.roles?.split(', ').map((roleName, index) => (
                    <Badge 
                      key={index}
                      className="text-gray-900 border text-xs"
                    >
                      {roleName}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Mensaje
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {publication.mensaje}
              </p>
            </div>
          </div>
          {loadingId ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Cargando archivos y generando accesos seguros...
            </div>
          ) : (
            <>
              {archivos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Archivos Adjuntos ({archivos.length})
                  </h3>
                  <div className="space-y-2">
                    {archivos.map((file, idx) => (
                      <div 
                        key={file.id_archivo_pub}
                        className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#fcb900] transition-colors group overflow-hidden"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 max-w-full">
                          <div 
                            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${categoryColor}20` }}
                          >
                            <div style={{ color: categoryColor }}>
                              {getMediaIcon(file.tipo as any)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 max-w-full">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 break-words">
                              {file.nombre_archivo}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {file.tipo === "pdf" ? "Documento PDF" : file.tipo === "image" ? "Imagen" : "Video"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loadingId === file.id_archivo_pub}
                            onClick={() => handleViewMedia(idx)}
                            className="border-gray-300 hover:border-[#fcb900] hover:bg-[#fcb900]/10 bg-white text-gray-900"
                          >
                            <Eye className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Ver</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-[#fcb900] to-[#e5a700] hover:from-[#e5a700] hover:to-[#d19600] text-gray-900"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
      <MediaViewer
        isOpen={isMediaViewerOpen}
        onClose={() => setIsMediaViewerOpen(false)}
        files={archivos.map(file => ({
          id: String(file.id_archivo_pub),
          name: file.nombre_archivo || "archivo",
          url_archivo: file.url_archivo || "",
          type: file.tipo as "image" | "pdf" | "video"
        }))}
        initialIndex={selectedMediaIndex}
        autoEnterFullscreen={false}
        disableFullscreen={false}
      />
    </Dialog>
  );
}