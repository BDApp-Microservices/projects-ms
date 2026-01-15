import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config';
import { ProyectoModule } from './proyecto/proyecto.module';
import { ClienteModule } from './cliente/cliente.module';
import { AsesoriaTecnicaModule } from './asesoria-tecnica/asesoria-tecnica.module';
import { EvidenciaImagenModule } from './evidencia-imagen/evidencia-imagen.module';
import { RequisitoModule } from './requisito/requisito.module';
import { ProyectoRequisitoModule } from './proyecto-requisito/proyecto-requisito.module';
import { AuditoriaProyectoModule } from './auditoria-proyecto/auditoria-proyecto.module';
import { ProyeccionModule } from './proyeccion/proyeccion.module';
import { ProyeccionSemanalModule } from './proyeccion-semanal/proyeccion-semanal.module';
import { ProyectoProductoModule } from './proyecto-producto/proyecto-producto.module';
import { AuditoriaCotizacionModule } from './auditoria-cotizacion/auditoria-cotizacion.module';
import { ProyectoArchivoModule } from './proyecto-archivo/proyecto-archivo.module';
import { GcsStorageModule } from './gcs-storage/gcs-storage.module';


@Module({
  imports: [
    GcsStorageModule,
    // Otros modulos
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
    RequisitoModule,
    ProyectoRequisitoModule,
    AuditoriaProyectoModule,
    ProyeccionModule,
    ProyeccionSemanalModule,
    ProyectoProductoModule,
    AuditoriaCotizacionModule,
    ProyectoArchivoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
