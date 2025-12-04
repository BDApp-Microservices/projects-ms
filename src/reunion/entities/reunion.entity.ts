import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Oportunidad } from "src/oportunidad/entities/oportunidad.entity";

@Entity()
export class Reunion {
    @PrimaryGeneratedColumn('uuid', { name: 'id_reunion' })
    idReunion: string;

    @Column('timestamp', { name: 'fecha_hora' })
    fechaHora: Date;

    @Column('varchar', { name: 'tipo', length: 50 })
    tipo: string;

    @Column('varchar', { name: 'asunto', length: 100 })
    asunto: string;

    @Column('text', { name: 'observaciones', nullable: true })
    notas: string;

    // Relaciones
    @ManyToOne(() => Oportunidad, oportunidad => oportunidad.reuniones)
    @JoinColumn({ name: 'id_oportunidad', referencedColumnName: 'idOportunidad' })
    idOportunidad: string;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
