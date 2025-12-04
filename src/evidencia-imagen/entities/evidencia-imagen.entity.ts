import { AsesoriaTecnica } from "src/asesoria-tecnica/entities/asesoria-tecnica.entity";
import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity()
export class EvidenciaImagen {
    @PrimaryGeneratedColumn('uuid', { name: 'id_evidencia_imagen' })
    idEvidenciaImagen: string;

    @Column('text', { name: 'imagen_url', nullable: true })
    imagenUrl: string;

    @Column('text', { name: 'descripcion', nullable: true })
    descripcion: string;

    @ManyToOne(() => AsesoriaTecnica, (asesoriaTecnica) => asesoriaTecnica.evidenciasImagen)
    @JoinColumn({ name: 'id_asesoria_tecnica', referencedColumnName: 'idAsesoriaTecnica' })
    idAsesoriaTecnica: AsesoriaTecnica;
}
