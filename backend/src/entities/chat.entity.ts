import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ChatEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column()
  answer: string;

  @Column()
  timestamp: Date;
}
