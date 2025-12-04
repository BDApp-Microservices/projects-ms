import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Cliente } from "src/cliente/entities/cliente.entity";

@Entity()
export class AuditoriaCliente {
    @PrimaryGeneratedColumn('uuid', { name: 'id_auditoria_cliente' })
    idAuditoriaCliente: string;

    @Column('date', { name: 'fecha_baja' })
    fechaBaja: Date;

    @Column('varchar', { name: 'motivo_principal', length: 100 })
    motivoPrincipal: string;

    @Column('text', { name: 'descripcion', nullable: false })
    descripcion: string;

    // Relaciones

    // Cliente al que pertenece la auditoria
    @ManyToOne(() => Cliente, cliente => cliente.auditoriasCliente)
    @JoinColumn({ name: 'id_cliente', referencedColumnName: 'idCliente' })
    idCliente: Cliente;

    // Fin Relaciones

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
