import { error } from "console";
import { CategoriaPublicacion } from "../types/Publicacion";
import { authFetch } from "../utils/auth-fetch";

export async function getCategoriasPublicacion(): Promise<CategoriaPublicacion[]> {
    const response = await authFetch(`/publicaciones/getAllCategoriasPublicacion `, {
        headers: {
            "Content-Type": "application/json",
        }
    });
    
    if (!response.ok) {
    const text = await response.text().catch(() => '');
    let details: any;
    try { details = JSON.parse(text); } catch {}
    console.error('Upload falló:', details || text);
    throw new Error(details?.error || details?.message || 'Error al cargar categorías de publicaciones');
  }
    
    return response.json();
}

export async function getAllPublicaciones() {
    const response = await authFetch(`/publicaciones/getAllPublicaciones`, {
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        console.error('Error al obtener publicaciones:', details || text);
        throw new Error(details?.error || details?.message || 'Error al obtener publicaciones');
    }

    return response.json();
}

export async function updateCategoriaById(id_categoria_publicacion: number, nombre: string, color: string) {
    const response = await authFetch(`/publicaciones/updateCategoriaById/${id_categoria_publicacion}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, color })
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        console.error('Error al actualizar categoría:', details || text);
        alert(details?.error || details?.message || 'Error al actualizar categoría de publicación');
    }

    return response.json();
}

export async function createCategoria(nombre: string, color: string) {
    const response = await authFetch(`/publicaciones/createCategoria`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, color })

    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        console.error('Error al crear categoría:', details || text);
        alert(details?.error || details?.message || 'Error al crear categoría de publicación');
    }

    return response.json();
}

export async function deleteCategoriaById(id_categoria_publicacion: number) {
    const response = await authFetch(`/publicaciones/deleteCategoriaById/${id_categoria_publicacion}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        console.error('Error al eliminar categoría:', details || text);
        alert(details?.error || details?.message || 'Error al eliminar categoría de publicación');
    }

    return response.json();
}

export async function createPublicacionCompleta(data: any, files: File[]) {
    const response = await authFetch(`/publicaciones/createPublicacion`, {
        method: "POST",
        body: JSON.stringify(data)
    });

    if(!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        
        console.error('Error al crear publicación:', details || text);
        throw new Error(details?.error || details?.message || 'Error al crear publicación');
    }

    const pubCreada = await response.json();

    if (files.length > 0 && pubCreada.id_publicacion) {
        const form = new FormData();
        files.forEach(f => form.append('archivos', f));

        await authFetch(`/publicaciones/uploadArchivosPublicacion/${pubCreada.id_publicacion}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: form
        });
    }

    return pubCreada;
}

export async function updatePublicacionById(id_publicacion: number, titulo: string, mensaje: string, id_categoria_publicacion: number, id_roles: number[]) {
    const response = await authFetch(`/publicaciones/updatePublicacionById/${id_publicacion}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ titulo, mensaje, id_categoria_publicacion, id_roles })
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        console.error('Error al actualizar publicación:', details || text);
        alert(details?.error || details?.message || 'Error al actualizar publicación');
    }

    return response.json();
}

export async function togglePublicationById(id_publicacion: number) {
    const response = await authFetch(`/publicaciones/togglePublicationById/${id_publicacion}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        console.error('Error al inactivar publicación:', details || text);
        alert(details?.error || details?.message || 'Error al inactivar publicación');
    }

    return response.json();
}

export async function toggleCategoriaById(id_categoria_publicacion: number) {
    const response = await authFetch(`/publicaciones/toggleCategoriaById/${id_categoria_publicacion}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        console.error('Error al cambiar estado de categoría:', details || text);
        const errorMsg = details?.error || details?.message || 'Error al cambiar estado';
        alert(errorMsg);
        throw new Error(errorMsg); // LANZAR ERROR PARA QUE EL CATCH DEL COMPONENTE LO DETECTE
    }

    return response.json();
}

export async function getArchivosByPublicacion(id_publicacion: number) {
    const response = await authFetch(`/publicaciones/getArchivosByPublicacion/${id_publicacion}`, {
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        console.error('Error al obtener archivos de publicación:', details || text);
        throw new Error(details?.error || details?.message || 'Error al obtener archivos de publicación');
    }

    return response.json();
}

export async function deleteArchivos(id_archivos: string[]) {
    const response = await authFetch('/publicaciones/deleteArchivos', {
        method: 'POST',
        body: JSON.stringify({ id_archivos })
    });

    if(!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        
        console.error('Error al eliminar archivos:', details || text);
        throw new Error(details?.error || details?.message || 'Error al eliminar contenido multimedia');
    }

    return response.json();
}

export async function uploadArchivosPublicacion(id: number, files: File[]) {
  const formData = new FormData();
  files.forEach(file => formData.append('archivos', file)); 

  const response = await authFetch(`/publicaciones/uploadArchivosPublicacion/${id}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
      const text = await response.text();
      console.error("Error del servidor:", text);
      throw new Error("Error al subir los archivos");
  }

  return response.json();
}

export async function getUsersView(id_publicacion: number) {
    const response = await authFetch(`/publicaciones/getUsersViews/${id_publicacion}`, {
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        let details: any;
        try { details = JSON.parse(text); } catch {}
        console.error('Error al obtener archivos de publicación:', details || text);
        throw new Error(details?.error || details?.message || 'Error al obtener archivos de publicación');
    }

    return response.json();
}