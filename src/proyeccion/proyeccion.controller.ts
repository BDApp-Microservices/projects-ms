import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyeccionService } from './proyeccion.service';
import { CreateProyeccionDto } from './dto/create-proyeccion.dto';
import { UpdateProyeccionDto } from './dto/update-proyeccion.dto';

/**
 * Controlador de Proyecciones
 * Maneja las comunicaciones NATS para el módulo de proyecciones
 */
@Controller()
export class ProyeccionController {
  constructor(private readonly proyeccionService: ProyeccionService) { }

  /**
   * Crea una nueva proyección
   * Comando: { cmd: 'create.proyeccion' }
   */
  @MessagePattern({ cmd: 'create.proyeccion' })
  create(@Payload() createProyeccionDto: CreateProyeccionDto) {
    return this.proyeccionService.create(createProyeccionDto);
  }

  /**
   * Obtiene todas las proyecciones
   * Comando: { cmd: 'findAll.proyeccion' }
   */
  @MessagePattern({ cmd: 'findAll.proyeccion' })
  findAll() {
    return this.proyeccionService.findAll();
  }

  /**
   * Obtiene una proyección por ID
   * Comando: { cmd: 'findOne.proyeccion' }
   */
  @MessagePattern({ cmd: 'findOne.proyeccion' })
  findOne(@Payload() id: string) {
    return this.proyeccionService.findOne(id);
  }

  /**
   * Obtiene proyecciones por proyecto-producto
   * Comando: { cmd: 'findByProyectoProducto.proyeccion' }
   */
  @MessagePattern({ cmd: 'findByProyectoProducto.proyeccion' })
  findByProyectoProducto(@Payload() idProyectoProducto: string) {
    return this.proyeccionService.findByProyectoProducto(idProyectoProducto);
  }

  /**
   * Obtiene proyecciones por proyecto
   * Comando: { cmd: 'findByProyecto.proyeccion' }
   */
  @MessagePattern({ cmd: 'findByProyecto.proyeccion' })
  findByProyecto(@Payload() idProyecto: string) {
    return this.proyeccionService.findByProyecto(idProyecto);
  }

  /**
   * Actualiza una proyección
   * Comando: { cmd: 'update.proyeccion' }
   * Payload: { id: string, dto: UpdateProyeccionDto }
   */
  @MessagePattern({ cmd: 'update.proyeccion' })
  update(@Payload() data: { id: string; dto: UpdateProyeccionDto }) {
    return this.proyeccionService.update(data.id, data.dto);
  }

  /**
   * Elimina una proyección
   * Comando: { cmd: 'remove.proyeccion' }
   */
  @MessagePattern({ cmd: 'remove.proyeccion' })
  remove(@Payload() id: string) {
    return this.proyeccionService.remove(id);
  }
}
