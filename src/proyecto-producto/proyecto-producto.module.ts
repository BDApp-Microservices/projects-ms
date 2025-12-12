import { Module } from '@nestjs/common';
import { ProyectoProductoService } from './proyecto-producto.service';
import { ProyectoProductoController } from './proyecto-producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoProducto } from './entities/proyecto-producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProyectoProducto])],
  controllers: [ProyectoProductoController],
  providers: [ProyectoProductoService],
})
export class ProyectoProductoModule {}
