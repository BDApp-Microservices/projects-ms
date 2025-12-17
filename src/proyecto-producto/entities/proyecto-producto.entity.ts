import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Proyeccion } from 'src/proyeccion/entities/proyeccion.entity';

@Entity()
export class ProyectoProducto {
  @PrimaryGeneratedColumn('uuid', { name: 'id_proyecto_producto' })
  idProyectoProducto: string;

  @Column('decimal', {
    name: 'cantidad',
    precision: 10,
    scale: 2,
  })
  cantidad: number;

  @Column('decimal', {
    name: 'comision_estimada',
    precision: 10,
    scale: 2,
    default: 0,
  })
  comisionEstimada: number;

  @Column('decimal', {
    name: 'precio_venta',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  precioVenta: number;

  @Column('boolean', {
    name: 'esta_activo',
    default: true,
  })
  estaActivo: boolean;

  @Column('timestamp with time zone', {
    name: 'fecha_desactivacion',
    nullable: true,
  })
  fechaDesactivacion: Date | null;

  @ManyToOne(() => Proyecto, proyecto => proyecto.proyectoProductos)
  @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idProyecto' })
  idProyecto: string;

  @Column('uuid', { name: 'id_producto' })
  idProducto: string;

  // Proyecciones asociadas al proyecto-producto
  @OneToMany(() => Proyeccion, proyeccion => proyeccion.idProyectoProducto)
  proyecciones: Proyeccion[];
}
