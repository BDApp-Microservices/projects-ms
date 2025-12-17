import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProyeccionService } from './proyeccion.service';
import { ProyeccionController } from './proyeccion.controller';
import { Proyeccion } from './entities/proyeccion.entity';
import { ProyeccionSemanal } from 'src/proyeccion-semanal/entities/proyeccion-semanal.entity';
import { ProyectoProducto } from 'src/proyecto-producto/entities/proyecto-producto.entity';
import { ProductoClientService } from 'src/common/services/producto-client.service';
import { envs, NATS_SERVICE } from 'src/config';

/**
 * Módulo de Proyecciones
 * 
 * Gestiona las proyecciones de productos en proyectos,
 * incluyendo el cálculo automático de metrados y generación
 * de proyecciones semanales.
 * 
 * Dependencias:
 * - ProyectoProducto: Para obtener proyecto, producto y cantidad
 * - NATS: Para comunicarse con dispatch-ms y obtener producto
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Proyeccion, ProyeccionSemanal, ProyectoProducto]),
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers,
        },
      },
    ]),
  ],
  controllers: [ProyeccionController],
  providers: [ProyeccionService, ProductoClientService],
  exports: [ProyeccionService],
})
export class ProyeccionModule {}
