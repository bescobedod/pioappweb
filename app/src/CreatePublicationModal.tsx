import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X, Upload, FileText, Image, Video, Check, ChevronDown, Users, ChevronsUpDown } from "lucide-react";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { cn } from "./ui/utils";
import type { MediaFile } from "./PublicationsView";
import { CategoriaPublicacion, DetallePublicacion, Rol } from "./types/Publicacion";
import { createPublicacionCompleta } from "./api/PublicacionApi";

interface CreatePublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (publication: Omit<DetallePublicacion, "id_publicacion" | "createdAt" | "updatedAt">) => void;
  categories: CategoriaPublicacion[];
  availableRoles: Rol[];
}

export function CreatePublicationModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  availableRoles = [],
}: CreatePublicationModalProps) {
  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleRole = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId || !title.trim() || !message.trim()) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      setIsSubmitting(true);

      const publicationData = {
        titulo: title.trim(),
        mensaje: message.trim(),
        id_categoria_publicacion: parseInt(categoryId),
        id_roles: selectedRoles,
      };

      const filesToUpload = media
        .map((m) => m.raw)
        .filter((file): file is File => file !== undefined);

      const response = await createPublicacionCompleta(publicationData, filesToUpload);

      if (onSubmit) {
        onSubmit(response);
      }

      resetForm();
      onClose();

    } catch (error: any) {
      console.error("Error al crear publicación:", error);
      alert(error?.message || "Error al crear la publicación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategoryId("");
    setTitle("");
    setMessage("");
    setMedia([]);
    setSelectedRoles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: MediaFile[] = [];
    
    Array.from(files).forEach(file => {
      let type: "image" | "pdf" | "video" = "image";
      
      if (file.type.startsWith("image/")) {
        type = "image";
      } else if (file.type === "application/pdf") {
        type = "pdf";
      } else if (file.type.startsWith("video/")) {
        type = "video";
      }

      newMedia.push({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type,
        url_archivo: URL.createObjectURL(file),
        size: file.size,
        raw: file
      });
    });

    setMedia([...media, ...newMedia]);
  };

  const handleRemoveMedia = (id: string) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Nueva Publicación</DialogTitle>
          <DialogDescription>
            Crea una nueva publicación con visibilidad por roles opcional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-900">Categoría <span className="text-red-500">*</span></Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="border-gray-300 text-gray-900">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    if (!cat?.id_categoria_publicacion) return null;

                    return (
                      <SelectItem 
                        key={cat.id_categoria_publicacion} 
                        value={cat.id_categoria_publicacion.toString()}
                      >
                        {cat.nombre}
                      </SelectItem>
                    );
                  })}
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
          </div>
          {selectedRoles.length > 0 && (
            <div className="flex flex-wrap gap-2 -mt-2">
              {selectedRoles.map(roleId => {
                const role = availableRoles.find(r => r.id_rol === roleId);
                return (
                  <Badge key={roleId} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {role?.name}
                  </Badge>
                );
              })}
            </div>
          )}
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
                  className="border-gray-300 hover:border-[#fcb900] bg-white"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Seleccionar Archivos
                </Button>
                <input
                  id="file-upload"
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
              {isSubmitting ? "Creando..." : "Crear Publicación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}