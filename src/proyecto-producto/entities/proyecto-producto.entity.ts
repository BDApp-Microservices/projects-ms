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

  // Campos nuevos para seguimiento de costos

  // Fecha aproximada de envio de la cotizacion
  @Column('date', { name: 'fecha_aprox_envio', nullable: true })
  fechaAproxEnvio: Date;

  @Column('varchar', { name: 'actividad', length: 20, nullable: true })
  actividad: string; // COTIZACION, ACTUALIZACION

  @Column('text', { name: 'observaciones', nullable: true })
  observaciones: string;

  @Column('varchar', { name: 'estado', length: 20, nullable: true })
  estado: string; // PENDIENTE, PROCESO, ENVIADO, NO_COTIZAR, EN_PAUSA

  @Column('varchar', { name: 'sistema_inicial', length: 50, nullable: true })
  sistemaInicial: string;

  // Fecha real de envio de la cotizacion
  @Column('date', { name: 'fecha_envio', nullable: true })
  fechaEnvio: Date;


  // Relaciones

  @ManyToOne(() => Proyecto, proyecto => proyecto.proyectoProductos)
  @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idProyecto' })
  idProyecto: string;

  @Column('uuid', { name: 'id_producto' }) // Relacion logica
  idProducto: string;

  // Usuario que elaboro la cotizacion
  @Column('uuid', { name: 'elaborado_por', nullable: true })
  elaboradoPor: string; // Relacion logica

  // Proyecciones asociadas al proyecto-producto
  @OneToMany(() => Proyeccion, proyeccion => proyeccion.idProyectoProducto)
  proyecciones: Proyeccion[];
}
