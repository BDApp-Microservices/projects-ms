import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Oportunidad } from 'src/oportunidad/entities/oportunidad.entity';

@Entity()
export class OportunidadProducto {
  @PrimaryGeneratedColumn('uuid', { name: 'id_oportunidad_producto' })
  idOportunidadProducto: string;

  @ManyToOne(() => Oportunidad, { nullable: false })
  @JoinColumn({ name: 'id_oportunidad', referencedColumnName: 'idOportunidad' })
  oportunidad: Oportunidad;

  // Referencia lógica al producto del microservicio dispatch-ms
  @Column('uuid', { name: 'id_producto' })
  idProducto: string;

  @Column('decimal', { 
    name: 'cantidad', 
    precision: 10, 
    scale: 2,
    nullable: true,
    comment: 'Cantidad del producto. Se llena en la etapa de cotización'
  })
  cantidad: number;

  @Column('decimal', { 
    name: 'precio_unitario', 
    precision: 10, 
    scale: 2,
    nullable: true,
    comment: 'Precio unitario del producto. Necesario para escaleras y acero'
  })
  precioUnitario: number;

  @Column('varchar', { 
    name: 'estado', 
    length: 50,
    default: 'PENDIENTE_COTIZAR',
    comment: 'PENDIENTE_COTIZAR, COTIZADO, APROBADO'
  })
  estado: string;

  @Column('text', { name: 'observaciones', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;
}
