import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column('vector')
  embedding: number[];
}
