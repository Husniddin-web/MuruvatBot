import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Bot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("bigint")
  user_id: number;

  @Column()
  lang: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  district: string;

  @Column({ default: "user_role" })
  last_state: string;

  @Column({ default: false })
  is_active: boolean;
  @Column({ default: false })
  is_block: boolean;
}
