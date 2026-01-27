import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Cliente } from './entities/cliente.entity';
import { BaseResponseDto } from '../common/dto/base-response.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) { }

  /**
   * Busca un cliente por nombre comercial
   */
  async findByNombreComercial(nombreComercial: string): Promise<Cliente | null> {
    try {
      return await this.clienteRepo.findOne({
        where: { nombreComercial },
      });
    } catch (error) {
      throw new RpcException({
        message: 'Error al buscar cliente por nombre comercial',
        statusCode: 500,
        error: error.message,
      });
    }
  }

  /**
   * Busca un cliente por razón social
   */
  async findByRazonSocial(razonSocial: string): Promise<Cliente | null> {
    try {
      return await this.clienteRepo.findOne({
        where: { razonSocial },
      });
    } catch (error) {
      throw new RpcException({
        message: 'Error al buscar cliente por razón social',
        statusCode: 500,
        error: error.message,
      });
    }
  }

  /**
   * Crea o retorna un cliente existente
   * Si el cliente existe (por razonSocial), lo retorna
   * Si no existe, lo crea con tipoCliente='NUEVO' y activo=false
   */
  async findOrCreate(data: {
    razonSocial: string;
    ruc?: string;
    tipo?: string;
    credito?: string;
    condicion?: string;
    datos?: string;
  }): Promise<{ cliente: Cliente; esNuevo: boolean }> {
    try {
      // 1. Verificar si existe por razón social
      let cliente = await this.findByRazonSocial(data.razonSocial);

      if (cliente) {
        return { cliente, esNuevo: false };
      }

      // 2. Crear nuevo cliente
      cliente = this.clienteRepo.create({
        razonSocial: data.razonSocial,
        ruc: data.ruc || undefined,
        tipo: data.tipo || 'GENERAL',
        credito: data.credito || 'CONTADO',
        condicion: data.condicion || 'HABILITADO',
        datos: data.datos || '',
        estaActivo: false,
        tipoCliente: 'NUEVO',
      });

      const clienteGuardado = await this.clienteRepo.save(cliente);

      return { cliente: clienteGuardado, esNuevo: true };
    } catch (error) {
      throw new RpcException({
        message: 'Error al crear o buscar cliente',
        statusCode: 500,
        error: error.message,
      });
    }
  }

  /**
   * Crea un nuevo cliente con validaciones de unicidad
   */
  async create(createClienteDto: CreateClienteDto): Promise<BaseResponseDto<Cliente>> {
    try {
      // Validar que no exista cliente con la misma razón social
      const existeRazonSocial = await this.clienteRepo.findOne({
        where: { razonSocial: createClienteDto.razonSocial },
      });

      if (existeRazonSocial) {
        throw new RpcException({
          message: 'Ya existe un cliente con esta razón social',
          statusCode: HttpStatus.CONFLICT,
        });
      }

      // Validar que no exista cliente con el mismo RUC (si se proporciona)
      if (createClienteDto.ruc) {
        const existeRuc = await this.clienteRepo.findOne({
          where: { ruc: createClienteDto.ruc },
        });

        if (existeRuc) {
          throw new RpcException({
            message: 'Ya existe un cliente con este RUC',
            statusCode: HttpStatus.CONFLICT,
          });
        }
      }

      // Calcular siguiente numeroCliente de forma global
      const maxClienteResult = await this.clienteRepo
        .createQueryBuilder('c')
        .select('MAX(c.numeroCliente)', 'max')
        .getRawOne();

      const maxNumeroCliente = maxClienteResult && maxClienteResult.max ? parseInt(maxClienteResult.max, 10) : 0;
      const nextNumeroCliente = maxNumeroCliente + 1;

      // Crear el nuevo cliente
      const nuevoCliente = this.clienteRepo.create({
        ...createClienteDto,
        estaActivo: createClienteDto.estaActivo ?? false,
        tipoCliente: createClienteDto.tipoCliente || 'NUEVO',
        numeroCliente: nextNumeroCliente,
      });

      const clienteGuardado = await this.clienteRepo.save(nuevoCliente);

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Cliente creado exitosamente',
        data: clienteGuardado,
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al crear cliente',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  async findAll(): Promise<BaseResponseDto<Cliente[]>> {
    try {
      const clientes = await this.clienteRepo.find({
        relations: ['proyectos'],
        order: { fechaCreacion: 'DESC' },
      });

      return BaseResponseDto.success(
        clientes,
        'Clientes obtenidos exitosamente',
        200,
      );
    } catch (error) {
      throw new RpcException({
        message: 'Error al obtener clientes',
        statusCode: 500,
        error: error.message,
      });
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<Cliente>> {
    try {
      const cliente = await this.clienteRepo.findOne({
        where: { idCliente: id },
        relations: ['proyectos'],
      });

      if (!cliente) {
        throw new RpcException({
          message: 'Cliente no encontrado',
          statusCode: 404,
        });
      }

      return BaseResponseDto.success(
        cliente,
        'Cliente obtenido exitosamente',
        200,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al obtener cliente',
        statusCode: 500,
        error: error.message,
      });
    }
  }

  async update(id: string, updateClienteDto: UpdateClienteDto): Promise<BaseResponseDto<Cliente>> {
    try {
      const cliente = await this.clienteRepo.findOne({
        where: { idCliente: id },
      });

      if (!cliente) {
        throw new RpcException({
          message: 'Cliente no encontrado',
          statusCode: 404,
        });
      }

      const clienteActualizado = await this.clienteRepo.save({
        ...cliente,
        ...updateClienteDto,
      });

      return BaseResponseDto.success(
        clienteActualizado,
        'Cliente actualizado exitosamente',
        200,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al actualizar cliente',
        statusCode: 500,
        error: error.message,
      });
    }
  }
}
