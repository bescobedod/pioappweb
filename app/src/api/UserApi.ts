import { User } from "../types/User";
import { authFetch } from "../utils/auth-fetch";
import { PermisoEstadoModel, VwDetallePermisos } from "../types/PermisoEstado";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function updateUser(email: string) {
    const response = await authFetch(`/users/updateUser`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
}

export async function getUserByRol(rol: string): Promise<User[]> {
  const response = await authFetch(`/users/getUsersByRole/${rol}`,
    {
      headers: getAuthHeaders()
    }
  );
  if (!response.ok) {
    throw new Error("Error al obtener usuarios por rol");
  }
  return response.json();
}

export async function createPermisoCaso(id_user: string) {
  const response = await authFetch(`/users/createPermisoCaso/${id_user}`, {
    method: "POST",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
}

export async function getUsersPermisosEstados(): Promise<VwDetallePermisos[]> {
  const response = await authFetch(`/users/getUsersPermisosEstados`,
    {
      headers: getAuthHeaders()
    }
  );
  if (!response.ok) {
    throw new Error("Error al obtener usuarios con permisos");
  }
  return response.json();
}

export async function quitPermisoCaso(id_user: string) {
  const response = await authFetch(`/users/quitPermisoCaso/${id_user}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

    return response.json();
}

export async function getAllRoles() {
  const response = await authFetch(`/users/getAllRoles`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        console.error('Error al obtener roles:', details || text);
        alert(details?.error || details?.message || 'Error al obtener roles de usuario');
  }

  return response.json();
}