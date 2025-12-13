import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';

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

  @ManyToOne(() => Proyecto, proyecto => proyecto.proyectoProductos)
  @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idProyecto' })
  idProyecto: string;

  @Column('uuid', { name: 'id_producto' })
  idProducto: string;
}
