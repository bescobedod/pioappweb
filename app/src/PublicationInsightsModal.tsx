import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { 
  Users, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Search, 
  X
} from "lucide-react";
import { DetallePublicacion, UsuarioPublicacion } from "./types/Publicacion";
import { getUsersView } from "./api/PublicacionApi";

interface PublicationInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication: DetallePublicacion;
  categoryName: string;
  categoryColor: string;
}

export function PublicationInsightsModal({
  isOpen,
  onClose,
  publication,
  categoryName,
  categoryColor,
}: PublicationInsightsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "viewed" | "understood" | "pending">("all");
  const [users, setUsers] = useState<UsuarioPublicacion[]>([]);

  async function fetchUsers(id_publicacion: number) {
    const data = await getUsersView(id_publicacion);
    setUsers(data);
  }

  useEffect(() => {
    fetchUsers(publication.id_publicacion);
  }, [publication])

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
  
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const viewedCount = users.filter(u => u.estado === 2).length;
    const understoodCount = users.filter(u => u.estado === 3).length;
    const pendingCount = users.filter(u => u.estado === 1).length;

    return {
      totalUsers,
      viewedCount,
      understoodCount,
      pendingCount,
      viewedPercentage: Math.round((viewedCount / totalUsers) * 100),
      understoodPercentage: Math.round((understoodCount / totalUsers) * 100),
      pendingPercentage: 100 - (Math.round((viewedCount / totalUsers) * 100) + Math.round((understoodCount / totalUsers) * 100)),
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        user.usuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.rol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (filterStatus) {
      case "viewed":
        filtered = filtered.filter(u => u.estado === 2 && u.fecha_leido);
        break;
      case "understood":
        filtered = filtered.filter(u => u.estado === 3 && u.fecha_entendido);
        break;
      case "pending":
        filtered = filtered.filter(u => u.estado === 1);
        break;
    }

    return filtered;
  }, [searchQuery, filterStatus, users]);

  const getStatusIcon = (user: UsuarioPublicacion) => {
    if (user.estado === 3) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    } else if (user.estado === 2) {
      return <Eye className="w-5 h-5 text-blue-600" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (user: UsuarioPublicacion) => {
    if (user.estado === 3) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          Leído y Entendido
        </Badge>
      );
    } else if (user.estado === 2) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          Visto
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-300">
          Pendiente
        </Badge>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" w-[95vw] sm:w-[90vw] lg:w-[70vw] !max-w-none max-h-[95vh] overflow-y-auto flex flex-col">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <Badge
                className="mb-2"
                style={{
                  backgroundColor: `${categoryColor}20`,
                  color: categoryColor,
                  borderColor: categoryColor,
                }}
              >
                {categoryName}
              </Badge>
              <DialogTitle className="text-2xl text-gray-900 leading-tight mb-2">
                {publication.titulo}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Estadísticas de lectura y comprensión de la publicación
              </DialogDescription>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="text-xs text-gray-500">
                  Creada el {formatDateTime(publication.createdAt)}
                </span>
                <span className="text-xs text-gray-500">
                  • Creado por: <span className="font-medium text-gray-700">{publication.creado_por}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">• Roles:</span>
                  <div className="flex flex-wrap gap-1">
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
          </div>
        </DialogHeader>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-600">Total Usuarios</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{stats.viewedCount}</p>
                <p className="text-xs text-blue-700">Han Visto</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.viewedPercentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-blue-700">
                {stats.viewedPercentage}%
              </span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">{stats.understoodCount}</p>
                <p className="text-xs text-green-700">Han Entendido</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.understoodPercentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-green-700">
                {stats.understoodPercentage}%
              </span>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">{stats.pendingCount}</p>
                <p className="text-xs text-orange-700">Pendientes</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-orange-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.pendingPercentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-orange-700">
                {stats.pendingPercentage}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-gray-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o rol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-[#fcb900] text-gray-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className={
                filterStatus === "all"
                  ? "bg-gradient-to-r from-[#fcb900] to-[#e5a700] text-gray-900"
                  : "border-gray-300 bg-white"
              }
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
              className={
                filterStatus === "pending"
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "border-gray-300 bg-white"
              }
            >
              Pendientes
            </Button>
            <Button
              variant={filterStatus === "viewed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("viewed")}
              className={
                filterStatus === "viewed"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-gray-300 bg-white"
              }
            >
              Vistos
            </Button>
            <Button
              variant={filterStatus === "understood" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("understood")}
              className={
                filterStatus === "understood"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "border-gray-300 bg-white"
              }
            >
              Entendidos
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery
                  ? "No se encontraron usuarios"
                  : "No hay usuarios en este estado"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id_usuario}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#fcb900] to-[#e5a700] rounded-full flex items-center justify-center text-gray-900 font-semibold text-lg">
                    {user.usuario.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.usuario}
                    </p>
                    <p className="text-sm text-gray-600">{user.rol}</p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0 hidden sm:block">
                    {getStatusBadge(user)}
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0">{getStatusIcon(user)}</div>

                  {/* Timestamps */}
                  {(user.fecha_leido && user.fecha_entendido) && (
                    <div className="hidden lg:block flex-shrink-0 text-right text-xs text-gray-500 min-w-[120px]">
                      {user.fecha_entendido ? (
                        <>
                          <p>Entendió:</p>
                          <p className="font-medium">
                            {formatDateTime(user.fecha_entendido)}
                          </p>
                        </>
                      ) : user.fecha_leido ? (
                        <>
                          <p>Vió:</p>
                          <p className="font-medium">
                            {formatDateTime(user.fecha_leido)}
                          </p>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-[#fcb900] to-[#e5a700] hover:from-[#e5a700] hover:to-[#d19600] text-gray-900"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}