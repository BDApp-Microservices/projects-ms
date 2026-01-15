import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class ProyectoArchivo {
  @PrimaryGeneratedColumn('uuid', { name: 'id_proyecto_archivo' })
  idProyectoArchivo: string;

  @Column({ name: 'archivo_url', type: 'varchar', length: 255 })
  archivoUrl: string;

  @Column({ name: 'tipo_archivo', type: 'varchar', length: 25 })
  tipoArchivo: string;

  @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idProyecto' })
  @ManyToOne(() => Proyecto, (proyecto) => proyecto.proyectoArchivos)
  idProyecto: Proyecto;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;
}
