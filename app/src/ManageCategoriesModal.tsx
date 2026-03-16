import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Edit, Trash2, Palette, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { CategoriaPublicacion } from "./types/Publicacion";
import { updateCategoriaById, createCategoria, deleteCategoriaById, toggleCategoriaById } from "./api/PublicacionApi";

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoriaPublicacion[];
  onUpdateCategories: (categories: CategoriaPublicacion[]) => void;
  setPublications: React.Dispatch<React.SetStateAction<any[]>>;
}

const PRESET_COLORS = [
  "#fcb900",
  "#00d084",
  "#0693e3",
  "#eb144c",
  "#9900ef",
  "#ff6900",
  "#00d4ff",
  "#f78da7",
];

export function ManageCategoriesModal({ 
  isOpen, 
  onClose, 
  categories, 
  onUpdateCategories,
  setPublications
}: ManageCategoriesModalProps) {
  const [editingCategory, setEditingCategory] = useState<CategoriaPublicacion | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#fcb900");
  const [isCreating, setIsCreating] = useState(false);
  
  // Estado para el desplegable de inactivas
  const [showInactive, setShowInactive] = useState(false);

  // Filtros de categorías
  const activeCategories = categories.filter(c => c.estado);
  const inactiveCategories = categories.filter(c => !c.estado);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Por favor ingresa un nombre para la categoría");
      return;
    }

    try {
      const newlyCreatedCategory = await createCategoria(
        newCategoryName.trim(), 
        newCategoryColor
      );

      onUpdateCategories([...categories, newlyCreatedCategory]);
      setNewCategoryName("");
      setNewCategoryColor("#fcb900");
      setIsCreating(false);

    } catch (error) {
      console.error("Error al crear categoría:", error);
      alert("No se pudo crear la categoría en el servidor.");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    if (!editingCategory.nombre.trim()) {
      alert("Por favor ingresa un nombre para la categoría");
      return;
    }

    try {
      await updateCategoriaById(
        editingCategory.id_categoria_publicacion, 
        editingCategory.nombre.trim(), 
        editingCategory.color
      );

      const updatedList = categories.map(cat => 
        cat.id_categoria_publicacion === editingCategory.id_categoria_publicacion 
          ? editingCategory 
          : cat
      );

      onUpdateCategories(updatedList);
      setEditingCategory(null);
      
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar categoría en el servidor");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta categoría? Las publicaciones asociadas no se eliminarán.")) {
      try {
        await deleteCategoriaById(id);
        const updatedList = categories.filter(c => c.id_categoria_publicacion !== id);
        onUpdateCategories(updatedList);
      } catch (error) {
        console.error("Error al eliminar categoría:", error);
        alert("No se pudo eliminar la categoría del servidor.");
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCategory(null);
    setNewCategoryName("");
    setNewCategoryColor("#fcb900");
  };

  const handleToggleCategory = async (id_categoria: number) => {
    try {
      const updatedCategory = await toggleCategoriaById(id_categoria);

      const updatedCategories = categories.map(c => 
        c.id_categoria_publicacion === id_categoria ? updatedCategory : c
      );

      onUpdateCategories(updatedCategories);

      if (!updatedCategory.estado) {
        setPublications(prev => prev.map(p => 
          Number(p.id_categoria_publicacion) === id_categoria 
            ? { ...p, publicacion_estado: false } 
            : p
        ));
      }
    } catch (error) {
      console.error("Error al cambiar estado de categoría:", error);
      alert("No se pudo cambiar el estado de la categoría.");
    }
  };

  const renderCategoryRow = (category: CategoriaPublicacion) => (
    <div 
      key={category.id_categoria_publicacion}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        category.estado ? "bg-gray-50 border-gray-200" : "bg-gray-100 border-gray-200 opacity-75"
      }`}
    >
      {editingCategory?.id_categoria_publicacion === category.id_categoria_publicacion ? (
        <>
          <div className="relative group/color">
            <div 
              className="w-8 h-8 rounded-lg flex-shrink-0 cursor-pointer border-2 border-gray-300 hover:border-[#fcb900] flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: editingCategory?.color || "#ccc" }}
              onClick={() => {
                const currentIndex = PRESET_COLORS.indexOf(editingCategory.color);
                const nextIndex = (currentIndex + 1) % PRESET_COLORS.length;
                setEditingCategory({ ...editingCategory, color: PRESET_COLORS[nextIndex] });
              }}
              title="Click para cambiar color"
            >
              <Palette className="w-4 h-4 text-white/70" />
            </div>
          </div>
          <Input
            value={editingCategory?.nombre || ""}
            onChange={(e) => setEditingCategory({ ...editingCategory, nombre: e.target.value })}
            placeholder="Nombre de la categoría"
            className="flex-1 border-gray-300 focus:border-[#fcb900] text-gray-600"
            maxLength={30}
          />
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleUpdateCategory}
              className="bg-gradient-to-r from-[#fcb900] to-[#e5a700] hover:from-[#e5a700] hover:to-[#d19600] text-gray-900"
            >
              Guardar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 bg-white"
            >
              Cancelar
            </Button>
          </div>
        </>
      ) : (
        <>
          <div 
            className="w-8 h-8 rounded-lg flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className={`flex-1 text-sm font-medium ${category.estado ? "text-gray-900" : "text-gray-500 italic"}`}>
            {category.nombre} {!category.estado && "(Inactiva)"}
          </span>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleToggleCategory(category.id_categoria_publicacion)}
              className="border-gray-300 hover:border-blue-500 bg-white"
              title={category.estado ? "Desactivar" : "Activar"}
            >
              {category.estado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingCategory(category)}
              className="border-gray-300 hover:border-blue-500 bg-white"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteCategory(category.id_categoria_publicacion)}
              className="border-gray-300 hover:border-red-500 bg-white"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Administrar Categorías</DialogTitle>
          <DialogDescription>
            Gestiona las categorías de tus publicaciones: crear, editar y eliminar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Palette className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Cómo cambiar el color:</p>
                <p>1. Haz clic en el botón "Editar" (lápiz) de la categoría</p>
                <p>2. Haz clic repetidamente en el <strong>cuadrado de color con ícono de paleta</strong></p>
                <p>3. El color cambiará automáticamente entre los disponibles</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-900 font-bold">Categorías Activas ({activeCategories.length})</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {activeCategories.length > 0 ? (
                activeCategories.map(category => renderCategoryRow(category))
              ) : (
                <p className="text-sm text-gray-500 italic p-2 text-center">No hay categorías activas.</p>
              )}
            </div>
          </div>
          {inactiveCategories.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowInactive(!showInactive)}
                className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700">
                  Categorías Inactivas ({inactiveCategories.length})
                </span>
                {showInactive ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showInactive && (
                <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto pr-2">
                  {inactiveCategories.map(category => renderCategoryRow(category))}
                </div>
              )}
            </div>
          )}
          {isCreating ? (
            <div className="space-y-3 p-4 border-2 border-dashed border-[#fcb900] rounded-lg bg-[#fcb900]/5">
              <Label className="text-gray-900">Nueva Categoría</Label>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex-shrink-0 cursor-pointer border-2 border-gray-300 hover:border-[#fcb900] flex items-center justify-center"
                  style={{ backgroundColor: newCategoryColor }}
                  onClick={() => {
                    const currentIndex = PRESET_COLORS.indexOf(newCategoryColor);
                    const nextIndex = (currentIndex + 1) % PRESET_COLORS.length;
                    setNewCategoryColor(PRESET_COLORS[nextIndex]);
                  }}
                  title="Click para cambiar color"
                >
                  <Palette className="w-5 h-5 text-white/70" />
                </div>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  className="flex-1 border-gray-300 focus:border-[#fcb900] text-gray-900"
                  maxLength={30}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-300 bg-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  className="bg-gradient-to-r from-[#fcb900] to-[#e5a700] hover:from-[#e5a700] hover:to-[#d19600] text-gray-900"
                >
                  Crear Categoría
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsCreating(true)}
              variant="outline"
              className="w-full border-2 border-dashed border-gray-300 hover:border-[#fcb900] bg-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Nueva Categoría
            </Button>
          )}

          {/* Color Legend */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">
              Colores disponibles (click en el cuadrado para cambiar):
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <div
                  key={color}
                  className="w-8 h-8 rounded-md border border-gray-300"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-[#fcb900] to-[#e5a700] hover:from-[#e5a700] hover:to-[#d19600] text-gray-900"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}