import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { AsesoriaTecnica } from 'src/asesoria-tecnica/entities/asesoria-tecnica.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ProyectoRequisito } from 'src/proyecto-requisito/entities/proyecto-requisito.entity';
import { AuditoriaProyecto } from 'src/auditoria-proyecto/entities/auditoria-proyecto.entity';
import { ProyectoProducto } from 'src/proyecto-producto/entities/proyecto-producto.entity';
import { ProyectoArchivo } from 'src/proyecto-archivo/entities/proyecto-archivo.entity';

@Entity()
export class Proyecto {
  @PrimaryGeneratedColumn('uuid', { name: 'id_proyecto' })
  idProyecto: string;

  @Column('varchar', { name: 'proyecto_cup', length: 50, nullable: true })
  proyectoCUP: string;

  @Column('varchar', { name: 'nombre', length: 100 })
  nombre: string;

  @Column('varchar', { name: 'suf', length: 50, nullable: true })
  suf: string;

  @Column('varchar', { name: 'codigo', length: 5, nullable: true })
  codigo: string;

  @Column('int', { name: 'anio' })
  anio: number;

  @Column('date', { name: 'fecha_tentativa' })
  fechaTentativa: Date;

  @Column('boolean', { name: 'esta_activo', default: false })
  estaActivo: boolean;

  @Column('int', { name: 'pisos', nullable: true })
  pisos: number;

  @Column('int', { name: 'sotanos', nullable: true })
  sotanos: number;

  @Column('varchar', { name: 'ubicacion', length: 255, nullable: true })
  ubicacion: string;

  @Column('decimal', {
    name: 'latitud',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitud: number;

  @Column('decimal', {
    name: 'longitud',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitud: number;

  @Column('varchar', { name: 'numero_contacto', length: 20, nullable: true })
  numeroContacto: string;

  @Column('varchar', { name: 'nombre_contacto', length: 100, nullable: true })
  nombreContacto: string;

  @Column('varchar', { name: 'correo_contacto', length: 100, nullable: true })
  correoContacto: string;

  @Column('varchar', { name: 'estado', length: 50 })
  estado: string; // 'NEGOCIACIONES', 'CALIENTITO', 'CERRADO', 'PERDIDO', 'STAND BY'

  // Campos de auditoría

  // Contador de veces que se ha cambiado la fecha tentativa
  @Column('int', { name: 'contador_cambios_fecha_tentativa', default: 0 })
  contadorCambiosFechaTentativa: number;

  // Última fecha en la que se cambió la fecha tentativa
  @Column('timestamp with time zone', {
    name: 'ultimo_cambio_fecha_tentativa',
    nullable: true,
  })
  ultimoCambioFechaTentativa: Date;

  // Fecha de cierre del proyecto (cuando estado = CERRADO)
  @Column('date', { name: 'fecha_cierre', nullable: true })
  fechaCierre: Date;

  // Estado cerrado, estado especial para proyectos cerrados
  @Column('varchar', { name: 'estado_cerrado', nullable: true })
  estadoCerrado: string;

  // Fecha de inicio del despacho
  @Column('date', { name: 'fecha_inicio_despacho', nullable: true })
  fechaInicioDespacho: Date;

  // Relaciones

  // Ingeniero responsable - Relacion logica
  @Column('uuid', { name: 'id_ingeniero', nullable: true })
  idIngeniero: string;

  // Oficina Tecnica Responsable - Relacion logica
  @Column('uuid', { name: 'id_oficina_tecnica', nullable: true })
  idOficinaTecnica: string;

  // Cliente al que pertenece el proyecto - Relacion fisica
  @ManyToOne(() => Cliente, (cliente) => cliente.proyectos)
  @JoinColumn({ name: 'id_cliente', referencedColumnName: 'idCliente' })
  idCliente: Cliente;

  // Comercial que maneja el proyecto - Relacion logica
  @Column('uuid', { name: 'id_comercial' })
  idComercial: string;

  // Asesorias tecnicas asociadas al proyecto - Relacion fisica
  @OneToMany(
    () => AsesoriaTecnica,
    (asesoriaTecnica) => asesoriaTecnica.idProyecto,
  )
  asesoriasTecnicas: AsesoriaTecnica[];

  // Requisitos asociados al proyecto - Relacion fisica
  @OneToMany(
    () => ProyectoRequisito,
    (proyectoRequisito) => proyectoRequisito.idProyecto,
  )
  proyectos: ProyectoRequisito[];

  // Auditorias del proyecto - Relacion fisica
  @OneToMany(
    () => AuditoriaProyecto,
    (auditoriaProyecto) => auditoriaProyecto.idProyecto,
  )
  auditoriasProyecto: AuditoriaProyecto[];

  //Productos asociados al proyecto - Relacion fisica
  @OneToMany(
    () => ProyectoProducto,
    (proyectoProducto) => proyectoProducto.idProyecto,
  )
  proyectoProductos: ProyectoProducto[];

  //Archivos asociados al proyecto - Relacion fisica
  @OneToMany(
    () => ProyectoArchivo,
    (proyectoArchivo) => proyectoArchivo.idProyecto,
  )
  proyectoArchivos: ProyectoArchivo[];

  // Fin Relaciones

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;
}
