import { authFetch } from "../utils/auth-fetch";

export async function getOrdersDynamic(
    empresa: string | null,
    tienda: string | null,
    fechaInicio: string | null,
    fechaFin: string | null,
    nit: string | null
) {
    const pEmpresa = empresa && empresa.trim() !== "" ? empresa : "0";
    const pTienda = tienda && tienda.trim() !== "" ? tienda : "0";
    const pFechaInicio = fechaInicio && fechaInicio !== "" ? fechaInicio : "0";
    const pFechaFin = fechaFin && fechaFin !== "" ? fechaFin : "0";
    
    const pNit = nit && nit.trim() !== "" ? encodeURIComponent(nit.trim()) : "0";

    const response = await authFetch(
        `/pedidosya/getOrders/${pEmpresa}/${pTienda}/${pFechaInicio}/${pFechaFin}/${pNit}`,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { 
            details = JSON.parse(text); 
        } catch {
            details = null;
        }
        
        console.error('Error al obtener pedidos:', details || text);
        throw new Error(details?.error || details?.message || 'Error al obtener pedidos de PedidosYa');
    }

    return response.json();
}