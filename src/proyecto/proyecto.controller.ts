import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoCompletoDto } from './dto/create-proyecto-completo.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

@Controller()
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) { }

  @MessagePattern('proyecto.create.completo')
  createCompleto(@Payload() createProyectoCompletoDto: CreateProyectoCompletoDto) {
    return this.proyectoService.createProyectoCompleto(createProyectoCompletoDto);
  }

  @MessagePattern('findAllProyecto')
  findAll() {
    return this.proyectoService.findAll();
  }

  @MessagePattern('findOneProyecto')
  findOne(@Payload() id: string) {
    return this.proyectoService.findOne(id);
  }

  @MessagePattern('updateProyecto')
  update(@Payload() payload: { id: string } & UpdateProyectoDto) {
    const { id, ...updateData } = payload;
    return this.proyectoService.update(id, updateData);
  }

  @MessagePattern('updateProyectoProductos')
  updateProductos(
    @Payload() payload: { idProyecto: string; productos: Array<{ idProducto: string; cantidad?: number }> },
  ) {
    return this.proyectoService.updateProductos(payload.idProyecto, payload.productos);
  }

  @MessagePattern('removeProyecto')
  remove(@Payload() id: number) {
    return this.proyectoService.remove(id);
  }
}
