import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";
import { ProyectoProducto } from "src/proyecto-producto/entities/proyecto-producto.entity";
import { ProyeccionSemanal } from "src/proyeccion-semanal/entities/proyeccion-semanal.entity";
import { TipoProyeccion } from "src/common/enums/tipo-proyeccion.enum";
import { EstadoProyeccion } from "src/common/enums/estado-proyeccion.enum";

@Entity()
export class Proyeccion {
    @PrimaryGeneratedColumn('uuid', { name: 'id_proyeccion' })
    idProyeccion: string;

    @Column('date', { name: 'fecha_inicio' })
    fechaInicio: Date;

    @Column('date', { name: 'fecha_fin' })
    fechaFin: Date;

    @Column({
        type: 'enum',
        enum: TipoProyeccion,
        name: 'tipo_proyeccion'
    })
    tipoProyeccion: TipoProyeccion;

    @Column({
        type: 'enum',
        enum: EstadoProyeccion,
        name: 'estado'
    })
    estado: EstadoProyeccion;

    @Column('decimal', { name: 'metrado_piso', precision: 10, scale: 2 })
    metradoPiso: number;

    @Column('int', { name: 'pisos', default: 0 })
    pisos: number;

    @Column('int', { name: 'sotanos', default: 0 })
    sotanos: number;

    @Column('decimal', { name: 'pisos_semana', precision: 10, scale: 2 })
    pisosSemana: number;

    @Column('decimal', { name: 'total', precision: 10, scale: 2 })
    total: number;

    // Relaciones

    @ManyToOne(() => Proyecto, proyecto => proyecto.proyecciones)
    @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idProyecto' })
    idProyecto: Proyecto;

    @ManyToOne(() => ProyectoProducto, proyectoProducto => proyectoProducto.proyecciones)
    @JoinColumn({ name: 'id_proyecto_producto', referencedColumnName: 'idProyectoProducto' })
    idProyectoProducto: ProyectoProducto;

    // Proyecciones semanales asociadas a la proyeccion
    @OneToMany(() => ProyeccionSemanal, proyeccionSemanal => proyeccionSemanal.idProyeccion, {
        cascade: true
    })
    proyeccionesSemanales: ProyeccionSemanal[];

    // Fin relaciones

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
