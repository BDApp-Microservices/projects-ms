import { Module } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { ClienteModule } from 'src/cliente/cliente.module';
import { AuditoriaProyectoModule } from 'src/auditoria-proyecto/auditoria-proyecto.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, NATS_SERVICE } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto]),
    ClienteModule,
    AuditoriaProyectoModule,
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
  controllers: [ProyectoController],
  providers: [ProyectoService],
  exports: [ProyectoService],
})
export class ProyectoModule { }
