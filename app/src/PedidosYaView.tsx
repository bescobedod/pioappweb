import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Store,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Building,
  User,
  Search,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { getOrdersDynamic } from "./api/PedidosYaApi";
import { PedidosYaOrderRaw } from "./types/Order";
import { getAllTiendas } from "../src/api/TiendaModuloApi";
import { TiendaModulo } from "../src/types/TiendaModulo";
import { Combobox } from "./ui/combobox";

export function PedidosYaView() {
  const [stores, setStores] = useState<TiendaModulo[]>([]);
  const [selectedStore, setSelectedStore] = useState<TiendaModulo | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [filterStore, setFilterStore] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterNIT, setFilterNIT] = useState("");
  const [orders, setOrders] = useState<PedidosYaOrderRaw[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const handleSearch = async () => {
    if (isSearchDisabled()) return;
  
    setIsLoading(true);
    setHasSearched(true);

    const codEmpresa = selectedStore?.codigo_empresa || "0";
    const codTienda = selectedStore?.codigo_tienda || "0";
    const fechaInicio = filterStartDate === "" ? "all" : filterStartDate;
    const fechaFin = filterEndDate === "" ? "all" : filterEndDate;
    const nitBusqueda = filterNIT.trim() === "" ? "all" : filterNIT.trim();

    try {
      const data = await getOrdersDynamic(
        codEmpresa, 
        codTienda, 
        fechaInicio, 
        fechaFin, 
        nitBusqueda
      );
      setOrders(data);
    } catch (error) {
      console.error("Error en la petición:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedStore(null);
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterNIT("");
    setOrders([]);
    setHasSearched(false);
  };

  const isSearchDisabled = () => {
    const datesIncomplete = filterStartDate !== "" && filterEndDate === "";
    
    const allEmpty = 
      !selectedStore && 
      filterStartDate === "" && 
      filterEndDate === "" && 
      filterNIT.trim() === "";

    return datesIncomplete || allEmpty || isLoading;
  };

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
  
  useEffect(() => {
    fetchStores();
  }, []);

  const statusStyles: Record<string, string> = {
    RECIBIDO: "bg-green-100 text-green-800 border-green-300",
    ACEPTADO: "bg-blue-100 text-blue-800 border-blue-300",
    CANCELADO: "bg-red-100 text-red-800 border-red-300",
  };

  const defaultStyle = "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <div className="space-y-6 pt-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[#fcb900] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PedidosYa</h1>
            <p className="text-sm text-gray-600">Gestión de pedidos de clientes</p>
          </div>
        </div>
      </div>
      {/* Filtros */}
      <Card className="p-4 border-2 border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[250px]">
            {loading ? (
              <div className="h-10 flex items-center px-3 bg-gray-50 border border-gray-300 rounded-md text-xs text-gray-500">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cargando Tiendas...
              </div>
            ) : (
              <Combobox
                options={stores.map((store) => ({
                  id: store.id_tienda.toString(),
                  name: `${store.nombre_tienda} | DIVISIÓN ${store.division}`,
                  empresa: store.codigo_empresa,
                }))}
                // Usamos el ID de la tienda para el valor del filtro
                value={selectedStore ? selectedStore.id_tienda.toString() : ""}
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
                placeholder="Seleccionar tienda..."
                searchPlaceholder="Buscar Tienda..."
                emptyMessage="No se encontró la tienda"
                className="text-gray-900 w-full"
              />
            )}
          </div>
          <div className="relative w-40">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="pl-9 h-10 border-gray-300 text-xs text-gray-500"
            />
          </div>
          <div className="relative w-40">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="pl-9 h-10 border-gray-300 text-xs text-gray-500"
            />
          </div>
          <div className="relative w-44">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="NIT (ej. C/F)..."
              value={filterNIT}
              onChange={(e) => setFilterNIT(e.target.value)}
              className="pl-9 h-10 border-gray-300 text-gray-900"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              className="bg-[#fcb900] text-gray-900 hover:bg-[#e5a700] h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200"
              onClick={handleSearch}
              disabled={isSearchDisabled()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Buscar
            </Button>
            <Button onClick={handleResetFilters} variant="ghost" className="text-gray-500 h-10 px-2">
              Limpiar
            </Button>
          </div>
        </div>
      </Card>
      {/* Listado de Órdenes */}
      <div className="space-y-4">
        {!hasSearched ? (
          <Card className="p-12 text-center border-2 border-dashed border-gray-200">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Ingresa los filtros y haz clic en buscar para ver los pedidos</p>
          </Card>
        ) : orders.length === 0 && !isLoading ? (
          <Card className="p-12 text-center border-2 border-dashed border-gray-300">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No se encontraron pedidos</p>
          </Card>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrders.has(order._id);
            const orderDate = new Date(order.fecha);
            return (
              <Card key={order._id} className="overflow-hidden border-2 border-gray-200 hover:border-[#fcb900]/30 transition-all">
                <div className="p-6 cursor-pointer hover:bg-gray-50/50" onClick={() => toggleOrderExpansion(order._id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Consumidor */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Consumidor</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {order.orderData.customer.firstName} {order.orderData.customer.lastName}
                          </p>
                          <p className="text-xs text-gray-600">NIT: {order.orderData.corporateTaxId || "C/F"}</p>
                        </div>
                      </div>
                      {/* Tienda */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50">
                          <Store className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tienda</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{order.nombre_tienda}</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Building className="w-3 h-3" /> {order.nombre_empresa}
                          </p>
                        </div>
                      </div>
                      {/* Fecha */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Fecha</p>
                          <p className="text-sm font-medium text-gray-900">
                            {orderDate.toLocaleDateString("es-GT")}
                          </p>
                          <p className="text-xs text-gray-600">{orderDate.toLocaleTimeString("es-GT")}</p>
                        </div>
                      </div>
                      {/* Total */}
                      <div className="flex items-start gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total</p>
                          <p className="text-lg font-bold text-gray-900">
                            Q{parseFloat(order.orderData.price.grandTotal).toFixed(2)}
                          </p>
                          <Badge 
                            className={`text-xs border ${statusStyles[order.estado] || defaultStyle}`}
                          >
                            {order.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button variant="outline" size="sm" className="border-[#fcb900] text-[#fcb900] bg-yellow">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-[#fcb900]" /> : <ChevronDown className="w-5 h-5 text-[#fcb900]" />}
                      </Button>
                      <span className="text-xs text-gray-500 font-medium">
                        {order.orderData.products.length} ítems
                      </span>
                    </div>
                  </div>
                </div>
                {/* Detalle Expandible */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t-2 border-gray-100 bg-gray-50/30"
                    >
                      <div className="p-6 space-y-3">
                        {order.orderData.products.map((product, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">Precio Unit: Q{product.unitPrice}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">Cant: {product.quantity}</p>
                              <p className="text-[#fcb900] font-bold">Q{(parseFloat(product.quantity) * parseFloat(product.unitPrice)).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                        {order.orderData.discounts && order.orderData.discounts.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Descuentos y Promociones</p>
                            {order.orderData.discounts.map((discount, dIdx) => (
                              <div key={dIdx} className="bg-red-50 p-3 rounded-lg border border-red-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-red-200 text-red-700 border-red-300 text-[10px]">PROMO</Badge>
                                  <p className="text-sm font-medium text-red-800">{discount.name || 'Descuento aplicado'}</p>
                                </div>
                                <p className="text-sm font-bold text-red-600">- Q{parseFloat(discount.amount).toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end pt-2">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Total Neto en Orden:</p>
                            <p className="text-xl font-black text-gray-900">Q{order.orderData.price.grandTotal}</p>
                         </div>
                      </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}