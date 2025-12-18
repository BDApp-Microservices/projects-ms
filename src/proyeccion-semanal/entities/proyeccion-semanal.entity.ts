import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Proyeccion } from "src/proyeccion/entities/proyeccion.entity";

@Entity()
export class ProyeccionSemanal {
    @PrimaryGeneratedColumn('identity', { name: 'id_proyeccion_semanal' })
    idProyeccionSemanal: string;

    @Column('varchar', { name: 'numero_semana', length: 5 })
    numeroSemana: string;

    @Column('date', { name: 'fecha' })
    fecha: Date;

    @Column('decimal', { name: 'cantidad', precision: 10, scale: 2 })
    cantidad: number;

    @Column('varchar', { name: 'unidad', length: 10 })
    unidad: string;

    // Relaciones

    @ManyToOne(() => Proyeccion, proyeccion => proyeccion.proyeccionesSemanales, {
        nullable: false
    })
    @JoinColumn({ name: 'id_proyeccion', referencedColumnName: 'idProyeccion' })
    idProyeccion: Proyeccion;

    // Fin relaciones
}
