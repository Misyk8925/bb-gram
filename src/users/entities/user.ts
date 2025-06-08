import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FriendRequest } from "./friendRequest";
import { Friendship } from "./friendship";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column({ unique: true })
    username: string;

    @Column()
    imgUrl: string;

    @Column()
    description: string;

    @Column({ default: false })
    isBlocked: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.sender)
    friendRequestsSent: FriendRequest[];

    @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver)
    friendRequestsReceived: FriendRequest[];

    @OneToMany(() => Friendship, (friendship) => friendship.userAEntity)
    friendshipsA: Friendship[];

    @OneToMany(() => Friendship, (friendship) => friendship.userBEntity)
    friendshipsB: Friendship[];
}
