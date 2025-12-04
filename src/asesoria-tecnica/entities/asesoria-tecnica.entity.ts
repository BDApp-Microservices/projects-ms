import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EvidenciaImagen } from "src/evidencia-imagen/entities/evidencia-imagen.entity";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";

@Entity()
export class AsesoriaTecnica {

    @PrimaryGeneratedColumn('uuid', { name: 'id_asesoria_tecnica' })
    idAsesoriaTecnica: string;

    @Column('date', { name: 'fecha' })
    fecha: string;

    @Column('text', { name: 'observaciones', nullable: true })
    observaciones: string;

    @Column('varchar', { name: 'responsable', length: 50 })
    responsable: string;

    // Relaciones

    // Proyecto al que pertenece la asesoria tecnica
    @ManyToOne(() => Proyecto, proyecto => proyecto.asesoriasTecnicas)
    @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idProyecto' })
    idProyecto: Proyecto;

    // Usuario que crea la asesoria tecnica
    @Column('uuid', { name: 'registrado_por' })
    registradoPor: string;

    @OneToMany(() => EvidenciaImagen, evidenciaImagen => evidenciaImagen.idAsesoriaTecnica)
    evidenciasImagen: EvidenciaImagen[];

    // Fin Relaciones

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
