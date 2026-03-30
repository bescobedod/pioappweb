export interface PedidosYaDiscount {
  name: string;
  amount: string;
  type?: string;
}

export interface PedidosYaProduct {
  name: string;
  quantity: string;
  unitPrice: string;
}

export interface PedidosYaPrice {
  grandTotal: string;
  subTotal?: string; // Opcional, por si quieres mostrar el total antes de descuentos
}

export interface PedidosYaCustomer {
  firstName: string;
  lastName: string;
}

export interface PedidosYaOrderData {
  customer: PedidosYaCustomer;
  price: PedidosYaPrice;
  products: PedidosYaProduct[];
  discounts: PedidosYaDiscount[]; // <--- Agregado
  corporateTaxId: string;
  createdAt: string;
  comments?: {              // <--- Agregado por si quieres mostrar comentarios
    customerComment: string;
    vendorComment: string;
  };
}

export interface PedidosYaOrderRaw {
  _id: string;
  orderData: PedidosYaOrderData;
  storeId: string;
  empresa: string;          // <--- Agregado (útil para debug)
  tienda: string;           // <--- Agregado
  nombre_empresa: string;
  nombre_tienda: string;
  orderId: string;
  estado: string;
  fecha: string;
  total_descuento?: number; // <--- El campo calculado que enviamos desde el backend
}