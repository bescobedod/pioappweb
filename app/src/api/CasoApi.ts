import { TipoSolicitud } from "../types/TipoSolicitud";
import { Impacto } from "../types/Impacto";
import { Urgencia } from "../types/Urgencia";
import { Categoria } from "../types/Categoria";
import { Subcategoria } from "../types/Subcategoria"
import { CasoModel } from "../types/Caso";
import { VwDetalleCaso } from "../types/Caso";
import { authFetch } from "../utils/auth-fetch";
import { PermisoEstadoModel } from "../types/PermisoEstado";
import { CasoArchivoModel } from "../types/CasoArchivo";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function getAllTiposSolicitud(): Promise<TipoSolicitud[]> {
  const response = await authFetch(
    `/casos/getAllTiposSolicitudes`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener tipos de solicitudes");
  }
  return response.json();
}

export async function getAllImpactos(): Promise<Impacto[]> {
  const response = await authFetch(`/casos/getAllImpactos`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener los impactos para la solicitud");
  }

  return response.json();
}

export async function getAllUrgencias(): Promise<Urgencia[]> {
    const response = await authFetch(`/casos/getAllUrgencias`,
        {
        headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Error al obtener las urgencias para la solicitud");
    }

    return response.json();
}

export async function getAllCategorias(): Promise<Categoria[]> {
    const response = await authFetch(`/casos/getAllCategorias`,
        {
        headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Error al obtener las categorias para la solicitud");
    }

    return response.json();
}

export async function getSubcategoriaByCategoria(id_categoria: number): Promise<Subcategoria[]> {
    const response = await authFetch(`/casos/getSubcategoriaByCategoria/${id_categoria}`,
        {
        headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Error al obtener las subcategorias para la categoría seleccionada");
    }

    return response.json();
}

export async function createCaso(data: CasoModel) {
    const response = await authFetch(`/casos/createCaso`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error("Error al crear caso");
    }

    return response.json();
}

export async function getCasosByDivision(division: number): Promise<VwDetalleCaso[]> {
  const response = await authFetch(`/casos/getCasosByDivision/${division}`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener los casos por división");
  }

  return response.json();
}

export async function getCasoById(id_caso: string): Promise<CasoModel> {
    const response = await authFetch(`/casos/getCasoById/${id_caso}`,
    {
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener el caso solicitado");
  }

  return response.json();
}

export async function updateCaso(id_caso: string, payload: any) {
  const response = await authFetch(`/casos/updateCaso/${id_caso}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al actualizar caso");
  }

  return response.json();
}

export async function cierreReaperturaCaso(id_caso: string, id_estado: string, comments: string) {
  const response = await authFetch(`/casos/cierreReaperturaCaso/${id_caso}/${id_estado}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      motivo: comments
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al actualizar caso");
  }
  return response.json();
}

export async function permisoEstado(): Promise<PermisoEstadoModel> {
  const response = await authFetch(`/casos/permiso_estado`,
    {
      headers: getAuthHeaders()
    });
  if (!response.ok) {
    throw new Error("Error al obtener los permisos de estado");
  }

  return response.json();
}

export async function uploadCasoArchivos(id_caso: string, files: File[]) {
  const token = localStorage.getItem('token');

  const form = new FormData();
  files.forEach((f) => form.append('imagenes', f));

  const response = await fetch(`${BASE_URL}/casos/uploadArchivosCaso/${id_caso}/archivos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let details: any;
    try { details = JSON.parse(text); } catch {}
    console.error('Upload falló:', details || text);
    throw new Error(details?.error || details?.message || 'Error al cargar imagenes');
  }

  return response.json();
}

export async function getArchivosByCaso(id_caso: string): Promise<CasoArchivoModel[]> {
  const response = await authFetch(`/casos/getArchivosCaso/${id_caso}/archivos`, {
    headers: getAuthHeaders()
  });

  if(!response.ok) {
    throw new Error("Error al obtener imagenes adjuntas");
  }

  return response.json();
}