import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity('friend_requests')
export class FriendRequest {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: 'sender_id' })
    senderId: string;

    @Column({ name: 'receiver_id' })
    receiverId: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.friendRequestsSent)
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    @ManyToOne(() => User, (user) => user.friendRequestsReceived)
    @JoinColumn({ name: 'receiver_id' })
    receiver: User;
}
