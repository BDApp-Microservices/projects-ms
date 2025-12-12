

export class CreateClienteDto {
    ruc?: string;

    razonSocial: string;

    tipo?: string;

    credito?: string;

    condicion?: string;

    datos?: string;

    tipoCliente?: string; // 'NUEVO' o 'ANTIGUO'

    activo?: boolean;
}
