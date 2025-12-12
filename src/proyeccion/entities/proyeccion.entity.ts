import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";
import { ProyeccionSemanal } from "src/proyeccion-semanal/entities/proyeccion-semanal.entity";

@Entity()
export class Proyeccion {
    @PrimaryGeneratedColumn('uuid', { name: 'id_proyeccion' })
    idProyeccion: string;

    @Column('date', { name: 'fecha_inicio' })
    fechaInicio: Date;

    @Column('date', { name: 'fecha_fin' })
    fechaFin: Date;

    @Column('varchar', { name: 'tipo_proyeccion', length: 20 })
    tipoProyeccion: string; // 'REAL' o 'PROSPECTO'

    @Column('varchar', { name: 'estado', length: 20 })
    estado: string; // 'CALIENTITO', 'DESPACHANDO', 'CERRADO', 'TERMINADO'.

    @Column('decimal', { name: 'metrado_piso', precision: 10, scale: 2 })
    metradoPiso: number;

    @Column('int', { name: 'pisos' })
    pisos: number;

    @Column('int', { name: 'sotanos' })
    sotanos: number;

    @Column('decimal', { name: 'pisos_semana', precision: 10, scale: 2 })
    pisosSemana: number;

    @Column('decimal', { name: 'total', precision: 10, scale: 2 })
    total: number;

    // Relaciones

    @ManyToOne(() => Proyecto, proyecto => proyecto.proyecciones)
    @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idProyecto' })
    idProyecto: string;

    // Producto asociado a la proyeccion - Relacion logica
    @Column('uuid', { name: 'id_producto' })
    idProducto: string;

    // Proyecciones semanales asociadas a la proyeccion
    @OneToMany(() => ProyeccionSemanal, proyeccionSemanal => proyeccionSemanal.idProyeccion)
    proyeccionesSemanales: ProyeccionSemanal[];

    // Fin relaciones

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
