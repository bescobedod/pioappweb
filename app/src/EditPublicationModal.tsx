import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X, Upload, FileText, Image, Video } from "lucide-react";
import type { MediaFile } from "./PublicationsView";
import { CategoriaPublicacion, DetallePublicacion, Rol } from "./types/Publicacion";
import { updatePublicacionById, deleteArchivos, uploadArchivosPublicacion } from "./api/PublicacionApi";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "./ui/command";
import { Users } from "lucide-react";
import { cn } from "./ui/utils";

interface EditPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (publication: DetallePublicacion) => void;
  publication: DetallePublicacion;
  categories: CategoriaPublicacion[];
  availableRoles: Rol[];
}

export function EditPublicationModal({
  isOpen,
  onClose,
  onSubmit,
  publication,
  categories,
  availableRoles = [],
}: EditPublicationModalProps) {
  const [categoryId, setCategoryId] = useState<number>(publication.id_categoria_publicacion);
  const [title, setTitle] = useState(publication.titulo);
  const [message, setMessage] = useState(publication.mensaje);
  const [selectedRoles, setSelectedRoles] = useState<number[]>(publication.id_roles || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    setNewFiles([]);
    setFilesToDelete([]);
    setCategoryId(publication.id_categoria_publicacion);
    setTitle(publication.titulo);
    setMessage(publication.mensaje);
    setSelectedRoles(publication.id_roles || []);

    if (publication.archivos) {
      const mappedMedia: MediaFile[] = publication.archivos.map((file) => {
        let fileType: "image" | "pdf" | "video" = "image";
        if (file.tipo?.includes("pdf")) fileType = "pdf";
        else if (file.tipo?.startsWith("video")) fileType = "video";

        return {
          id: file.id_archivo_pub?.toString() || Date.now().toString(), 
          name: file.nombre_archivo ?? "Sin nombre",
          url_archivo: (file as any).url_archivo || "", 
          type: fileType,
        };
      });
      setMedia(mappedMedia);
    } else {
      setMedia([]);
    }
  }, [publication, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId || !title.trim() || !message.trim()) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
    setIsSubmitting(true);

    if (filesToDelete.length > 0) {
      await deleteArchivos(filesToDelete);
    }

    const updatedData = await updatePublicacionById(
      publication.id_publicacion,
      title,
      message,
      categoryId,
      selectedRoles
    );

    if (newFiles.length > 0) {
      await uploadArchivosPublicacion(publication.id_publicacion, newFiles);
    }

    if (updatedData) {
      alert("Publicación actualizada exitosamente");
      onSubmit(publication);
      onClose();
    }
  } catch (error) {
    console.error("Error al actualizar:", error);
    alert("Hubo un error al actualizar la publicación");
  } finally {
    setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setNewFiles(prev => [...prev, ...fileArray]);

    const newMedia: MediaFile[] = fileArray.map(file => {
      let type: "image" | "pdf" | "video" = "image";

      if(file.type.startsWith("image/")) type = "image";
      else if(file.type === "application/pdf") type = "pdf";
      else if(file.type.startsWith("video/")) type = "video";

      return {
        id: `new-${Date.now()}-${Math.random()}`, // ID temporal para la UI
        name: file.name,
        type,
        url_archivo: URL.createObjectURL(file),
        size: file.size,
      }
    })
    
    setMedia([...media, ...newMedia]);
  };

  const handleRemoveMedia = (id: string) => {
    if (id.startsWith('new-')) {
      const fileToRemove = media.find(m => m.id === id);
      setNewFiles(prev => prev.filter(f => f.name !== fileToRemove?.name));
    } else {
      setFilesToDelete(prev => [...prev, id]);
    }
    setMedia(media.filter(m => m.id !== id));
  };

  const getMediaIcon = (type: "image" | "pdf" | "video") => {
    switch (type) {
      case "image": return <Image className="w-4 h-4" />;
      case "pdf": return <FileText className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Editar Publicación</DialogTitle>
          <DialogDescription>
            Modifica el contenido de la publicación existente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-900">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Select value={categoryId.toString()} onValueChange={(value) => setCategoryId(Number(value))}>
              <SelectTrigger className="border-gray-300 focus:border-[#fcb900] text-gray-900">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id_categoria_publicacion} value={category.id_categoria_publicacion.toString() }>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.nombre}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
            <div className="space-y-2">
              <Label className="text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" /> Visibilidad (Roles)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full justify-between border-gray-300 font-normal bg-white"
                  >
                    <span className="truncate">
                      {selectedRoles.length > 0 
                        ? `${selectedRoles.length} seleccionado(s)` 
                        : "Público (Todos)"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar rol..." />
                    <CommandList>
                      <CommandEmpty>No hay resultados.</CommandEmpty>
                      <CommandGroup>
                        {availableRoles.map((role) => (
                          <CommandItem
                            key={role.id_rol}
                            value={role.name}
                            onSelect={() => toggleRole(role.id_rol)}
                          >
                            <div className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              selectedRoles.includes(role.id_rol)
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}>
                              <Check className="h-4 w-4" />
                            </div>
                            {role.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-900">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título de la publicación"
              className="border-gray-300 focus:border-[#fcb900] text-gray-900"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{title.length}/100 caracteres</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-900">
              Mensaje <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe el contenido de la publicación"
              className="border-gray-300 focus:border-[#fcb900] min-h-[150px] text-gray-900"
              maxLength={2000}
            />
            <p className="text-xs text-gray-500">{message.length}/2000 caracteres</p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900">Contenido Multimedia (Opcional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#fcb900] transition-colors">
              <div className="flex flex-col items-center justify-center gap-3">
                <Upload className="w-10 h-10 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    Arrastra archivos o haz click para seleccionar
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos: Imágenes (JPG, PNG), PDF, Videos (MP4, MOV)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 hover:border-[#fcb900] hover:bg-[#fcb900]/10 bg-white"
                  onClick={() => document.getElementById("file-upload-edit")?.click()}
                >
                  Agregar Archivos
                </Button>
                <input
                  id="file-upload-edit"
                  type="file"
                  multiple
                  accept="image/*,.pdf,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          {media.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-900">Archivos adjuntos ({media.length})</Label>
              <div className="space-y-2">
                {media.map(file => (
                  <div 
                    key={file.id}
                    className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-gray-600 flex-shrink-0">
                        {getMediaIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        {file.size && (
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedia(file.id)}
                      className="flex-shrink-0 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 bg-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#fcb900] to-[#e5a700] hover:from-[#e5a700] hover:to-[#d19600] text-gray-900"
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}