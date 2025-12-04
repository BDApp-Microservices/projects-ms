import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Oportunidad } from "src/oportunidad/entities/oportunidad.entity";
import { Requisito } from "src/requisito/entities/requisito.entity";

@Entity()
export class OportunidadRequisito {
    @PrimaryGeneratedColumn('uuid', { name: 'id_oportunidad_requisito' })
    idOportunidadRequisito: string;

    @Column('boolean', { name: 'cumplido', default: false })
    cumplido: boolean;

    @Column('date', { name: 'fecha_cumplimiento', nullable: true })
    fechaCumplimiento: Date;

    @Column('text', { name: 'comentarios', nullable: true })
    comentarios: string;

    // Relaciones
    @ManyToOne(() => Oportunidad, oportunidad => oportunidad.oportunidades)
    @JoinColumn({ name: 'id_oportunidad', referencedColumnName: 'idOportunidad' })
    idOportunidad: string;

    @ManyToOne(() => Requisito, requisito => requisito.requisitos)
    @JoinColumn({ name: 'id_requisito', referencedColumnName: 'idRequisito' })
    idRequisito: string;
}

