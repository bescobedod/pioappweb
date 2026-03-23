export interface PermisoEstadoModel {
    id_permiso?: number,
    id_user: number,
    puede_modificar: boolean,
    userCreatedAt?: number,
    userUpdatedAt?: number
}

export interface VwDetallePermisos {
    id_user: number,
    usuario: string,
    fecha: string,
    creado_por: string,
    id_rol: number
}