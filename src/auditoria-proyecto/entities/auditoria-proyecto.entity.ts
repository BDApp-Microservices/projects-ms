import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";

@Entity()
export class AuditoriaProyecto {
    @PrimaryGeneratedColumn('uuid', { name: 'id_auditoria_proyecto' })
    idAuditoriaProyecto: string;

    @Column('date', { name: 'fecha_baja' })
    fechaBaja: Date;

    @Column('varchar', { name: 'motivo_principal', length: 100, nullable: true })
    motivoPrincipal: string;

    @Column('text', { name: 'descripcion', nullable: true })
    descripcion: string;

    // Relaciones

    // Cliente al que pertenece la auditoria
    @ManyToOne(() => Proyecto, proyecto => proyecto.auditoriasProyecto)
    @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idProyecto' })
    idProyecto: Proyecto;

    // Fin Relaciones

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
