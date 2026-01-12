import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";

@Entity()
export class AuditoriaProyecto {
    @PrimaryGeneratedColumn('uuid', { name: 'id_auditoria_proyecto' })
    idAuditoriaProyecto: string;

    // Fecha en que el proyecto fue marcado como perdido
    @Column('timestamp with time zone', { name: 'fecha_perdida', default: () => 'CURRENT_TIMESTAMP' })
    fechaPerdida: Date;

    // Detalle corto de la pérdida (motivo principal)
    @Column('varchar', { name: 'detalle_perdida', length: 100, nullable: true })
    detallePerdida: string;

    // Descripción textual detallada de la pérdida
    @Column('text', { name: 'detalle_textual', nullable: true })
    detalleTextual: string;

    // Relaciones

    // Proyecto al que pertenece la auditoría
    @ManyToOne(() => Proyecto, proyecto => proyecto.auditoriasProyecto)
    @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idProyecto' })
    idProyecto: Proyecto;

    // Fin Relaciones

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
