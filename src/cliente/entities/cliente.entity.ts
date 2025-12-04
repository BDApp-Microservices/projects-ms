import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn('uuid', { name: 'id_cliente' })
    idCliente: string;

    @Column('varchar', { name: 'ruc', unique: true, length: 11 })
    ruc: string;

    @Column('varchar', { name: 'razon_social', unique: true, length: 100 })
    razonSocial: string;

    @Column('varchar', { name: 'tipo', length: 50 })
    tipo: string;

    @Column('varchar', { name: 'credito', length: 50 })
    credito: string;

    @Column('varchar', { name: 'condicion', length: 50 })
    condicion: string;

    @Column('varchar', { name: 'datos', length: 255 })
    datos: string;

    @Column('varchar', { name: 'estado', length: 50 })
    estado: string;

    // Relaciones

    // Proyectos asociados al cliente
    @OneToMany(() => Proyecto, proyecto => proyecto.idCliente)
    proyectos: Proyecto[];

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
