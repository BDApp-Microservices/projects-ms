import { Module } from '@nestjs/common';
import { ProyectoProductoService } from './proyecto-producto.service';
import { ProyectoProductoController } from './proyecto-producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoProducto } from './entities/proyecto-producto.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, NATS_SERVICE } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProyectoProducto]),
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
  controllers: [ProyectoProductoController],
  providers: [ProyectoProductoService],
})
export class ProyectoProductoModule { }
