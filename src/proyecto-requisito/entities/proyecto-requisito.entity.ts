import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Requisito } from "src/requisito/entities/requisito.entity";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";

@Entity()
export class ProyectoRequisito {
    @PrimaryGeneratedColumn('uuid', { name: 'id_proyecto_requisito' })
    idProyectoRequisito: string;

    @Column('boolean', { name: 'cumplido', default: false })
    cumplido: boolean;

    @Column('date', { name: 'fecha_cumplimiento', nullable: true })
    fechaCumplimiento: Date;

    @Column('text', { name: 'comentarios', nullable: true })
    comentarios: string;

    @ManyToOne(() => Requisito, requisito => requisito.requisitos)
    @JoinColumn({ name: 'id_requisito', referencedColumnName: 'idRequisito' })
    idRequisito: string;

    @ManyToOne(() => Proyecto, proyecto => proyecto.proyectos)
    @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idProyecto' })
    idProyecto: string;
}

