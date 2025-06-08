import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity('friendships')
export class Friendship {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: 'user_a_id' })
    userAId: string;

    @Column({ name: 'user_b_id' })
    userBId: string;

    @ManyToOne(() => User, (user) => user.friendshipsA)
    @JoinColumn({ name: 'user_a_id' })
    userAEntity: User;

    @ManyToOne(() => User, (user) => user.friendshipsB)
    @JoinColumn({ name: 'user_b_id' })
    userBEntity: User;
}