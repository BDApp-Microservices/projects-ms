import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, OneToOne } from "typeorm";
import { AsesoriaTecnica } from "src/asesoria-tecnica/entities/asesoria-tecnica.entity";
import { Cliente } from "src/cliente/entities/cliente.entity";
import { Oportunidad } from "src/oportunidad/entities/oportunidad.entity";
import { ProyectoRequisito } from "src/proyecto-requisito/entities/proyecto-requisito.entity";
import { AuditoriaProyecto } from "src/auditoria-proyecto/entities/auditoria-proyecto.entity";

@Entity()
export class Proyecto {
    @PrimaryGeneratedColumn('uuid', { name: 'id_proyecto' })
    idProyecto: string;

    @Column('varchar', { name: 'nombre', length: 100 })
    nombre: string;

    @Column('varchar', { name: 'suf', length: 50 })
    suf: string;

    @Column('varchar', { name: 'codigo', length: 5 })
    codigo: string;

    @Column('date', { name: 'fecha_tentativa' })
    fechaTentativa: Date;

    @Column('boolean', { name: 'esta_activo' })
    estaActivo: boolean;

    @Column('int', { name: 'total_pisos' })
    totalPisos: number;

    // Relaciones

    // Ingeniero responsable

    // Oficina Tecnica Responsable

    // Cliente al que pertenece el proyecto
    @ManyToOne(() => Cliente, cliente => cliente.proyectos)
    @JoinColumn({ name: 'id_cliente', referencedColumnName: 'idCliente' })
    idCliente: Cliente;

    // Asesorias tecnicas asociadas al proyecto
    @OneToMany(() => AsesoriaTecnica, asesoriaTecnica => asesoriaTecnica.idProyecto)
    asesoriasTecnicas: AsesoriaTecnica[];

    // A que oportunidad pertenece el proyecto
    @OneToOne(() => Oportunidad, oportunidad => oportunidad.proyecto)
    @JoinColumn({ name: 'id_oportunidad', referencedColumnName: 'idOportunidad' })
    idOportunidad: Oportunidad;

    // Requisitos asociados al proyecto - Relacion fisica
    @OneToMany(() => ProyectoRequisito, proyectoRequisito => proyectoRequisito.idProyecto)
    proyectos: ProyectoRequisito[];

    // Auditorias del proyecto
    @OneToMany(() => AuditoriaProyecto, auditoriaProyecto => auditoriaProyecto.idProyecto)
    auditoriasProyecto: AuditoriaProyecto[];

    // Fin Relaciones

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
}
