export interface CategoriaPublicacion {
    id_categoria_publicacion: number;
    nombre: string;
    color: string;
    estado?: boolean;
    user_created?: number;
    user_updated?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Publicacion {
    id_publicacion: number;
    id_categoria_publicacion: number;
    titulo: string;
    mensaje: string;
    estado: boolean;
    user_created: number;
    user_updated: number;
    created_at: string;
    updated_at: string;
    id_roles: number[];
}

export interface ArchivoMetadata {
    id_archivo_pub: number | null;
    nombre_archivo: string | null;
    tipo: "image" | "pdf" | "video" | string | null;
    url_archivo: string | null;
}

export interface DetallePublicacion {
    id_categoria_publicacion: number;
    id_publicacion: number;
    titulo: string;
    mensaje: string;
    createdAt: string;
    updatedAt: string;
    categoria_estado: boolean;
    publicacion_estado: boolean;
    id_roles: number[];
    creado_por: string;
    roles: string
    archivos: ArchivoMetadata[];
}

export interface Rol {
    id_rol: number;
    name: string;
    userCreated: number;
    userUpdated: number;
    createdAt: string;
    updatedAt: string;
}

export interface UsuarioPublicacion {
    id_vista: number;
    id_publicacion: number;
    id_usuario: number;
    usuario: string;
    fecha_leido: string;
    fecha_entendido: string;
    estado: number;
    rol: string;
}