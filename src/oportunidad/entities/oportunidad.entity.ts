import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { Reunion } from "src/reunion/entities/reunion.entity";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";

@Entity()
export class Oportunidad {
    @PrimaryGeneratedColumn('uuid', { name: 'id_oportunidad' })
    idOportunidad: string;

    @Column('varchar', { name: 'nombre_proyecto', length: 100 })
    nombreProyecto: string;

    @Column('varchar', { name: 'nombre_cliente', length: 100 })
    nombreCliente: string;

    @Column('varchar', { name: 'contacto', length: 100 })
    nombre_contacto: string;

    @Column('varchar', { name: 'telefono', length: 20, nullable: true })
    telefono: string;

    @Column('text', { name: 'ubicacion', nullable: true })
    ubicacion: string;

    @Column('varchar', { name: 'estado_oportunidad', length: 50 })
    estadoOportunidad: string;

    @Column('varchar', { name: 'estado_proyecto', length: 50 })
    estadoProyecto: string;

    @Column('date', { name: 'fecha_tentativa_despacho' })
    fechaTentativaDespacho: Date;

    // Relaciones
    @OneToMany(() => Reunion, reunion => reunion.idOportunidad)
    reuniones: Reunion[];

    // Comercial asociado a la oportunidad - Relacion logica
    @Column('uuid', { name: 'id_comercial' })
    idComercial: string;

    // Oportunidad relacionada con el proyecto - Relacion fisica
    @OneToOne(() => Proyecto, proyecto => proyecto.idOportunidad)
    proyecto: Proyecto;

    // Fin relaciones

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @CreateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
