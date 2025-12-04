import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config';
import { ProyectoModule } from './proyecto/proyecto.module';
import { ClienteModule } from './cliente/cliente.module';
import { AsesoriaTecnicaModule } from './asesoria-tecnica/asesoria-tecnica.module';
import { EvidenciaImagenModule } from './evidencia-imagen/evidencia-imagen.module';
import { AuditoriaClienteModule } from './auditoria-cliente/auditoria-cliente.module';
import { RequisitoModule } from './requisito/requisito.module';
import { OportunidadModule } from './oportunidad/oportunidad.module';
import { OportunidadRequisitoModule } from './oportunidad-requisito/oportunidad-requisito.module';
import { ReunionModule } from './reunion/reunion.module';


@Module({
  imports: [
    // Other modules can be imported here
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.dbhost,
      port: envs.dbport,
      username: envs.dbuser,
      password: envs.dbpassword,
      database: envs.dbname,
      synchronize: envs.nodeEnv !== 'production',
      autoLoadEntities: true,
    }),
    ProyectoModule,
    ClienteModule,
    AsesoriaTecnicaModule,
    EvidenciaImagenModule,
    AuditoriaClienteModule,
    RequisitoModule,
    OportunidadModule,
    OportunidadRequisitoModule,
    ReunionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
