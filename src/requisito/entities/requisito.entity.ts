import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { OportunidadRequisito } from '../../oportunidad-requisito/entities/oportunidad-requisito.entity';
@Entity()
export class Requisito {
    @PrimaryGeneratedColumn('uuid', { name: 'id_requisito' })
    idRequisito: string;

    @Column('varchar', { name: 'nombre', length: 100 })
    nombre: string;

    @Column('text', { name: 'descripcion', nullable: true })
    descripcion: string;

    @Column('varchar', { name: 'tipo', length: 50 })
    tipo: string;

    @Column('boolean', { name: 'obligatorio', default: true })
    obligatorio: boolean;

    @Column('boolean', { name: 'activo', default: true })
    activo: boolean;

    // Relaciones
    @OneToMany(() => OportunidadRequisito, oportunidadRequisito => oportunidadRequisito.idRequisito)
    requisitos: OportunidadRequisito[];

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
