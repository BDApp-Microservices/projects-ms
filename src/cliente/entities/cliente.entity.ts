import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn('uuid', { name: 'id_cliente' })
    idCliente: string;

    @Column('varchar', { name: 'ruc', unique: true, length: 11, nullable: true })
    ruc: string;

    @Column('varchar', { name: 'razon_social', unique: true, length: 100 })
    razonSocial: string;

    @Column('varchar', { name: 'tipo', length: 50, nullable: true, default: 'GENERAL' })
    tipo: string;

    @Column('varchar', { name: 'credito', length: 50, nullable: true, default: 'CONTADO' })
    credito: string;

    @Column('varchar', { name: 'condicion', length: 50, nullable: true, default: 'HABILITADO' })
    condicion: string;

    @Column('varchar', { name: 'datos', length: 255, nullable: true, default: '' })
    datos: string;

    @Column('boolean', { name: 'activo', default: false })
    activo: boolean;

    @Column('varchar', { name: 'tipo_cliente', length: 20, default: 'ANTIGUO' })
    tipoCliente: string; // 'NUEVO' o 'ANTIGUO'

    // Relaciones

    // Proyectos asociados al cliente
    @OneToMany(() => Proyecto, proyecto => proyecto.idCliente)
    proyectos: Proyecto[];

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
