import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn('uuid', { name: 'id_cliente' })
    idCliente: string;

    @Column('varchar', { name: 'ruc', unique: true, length: 11, nullable: true })
    ruc: string;

    @Column('varchar', { name: 'razon_social', length: 100, nullable: true })
    razonSocial: string;

    @Column('varchar', { name: 'nombre_comercial', length: 100 })
    nombreComercial: string;

    @Column('varchar', { name: 'tipo', length: 50, nullable: true })
    tipo: string;

    @Column('varchar', { name: 'credito', length: 50, nullable: true })
    credito: string;

    @Column('varchar', { name: 'condicion', length: 50, nullable: true })
    condicion: string;

    @Column('varchar', { name: 'datos', length: 255, nullable: true })
    datos: string;

    @Column('boolean', { name: 'esta_activo', default: false })
    estaActivo: boolean;

    @Column('varchar', { name: 'tipo_cliente', length: 20, default: 'ANTIGUO' })
    tipoCliente: string; // 'NUEVO' o 'ANTIGUO'

    // Numero de cliente - Campo especial para calcular el CUP
    @Column('int', { name: 'numero_cliente' })
    numeroCliente: number;

    // Relaciones

    // Proyectos asociados al cliente
    @OneToMany(() => Proyecto, proyecto => proyecto.idCliente)
    proyectos: Proyecto[];

    // Fin Relaciones

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
