import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user";
import {Repository} from "typeorm";
import {SupabaseService} from "../common/supabase/supabase.service";
import {FriendRequest} from "./entities/friendRequest";
import {Friendship} from "./entities/friendship";
import {PostsService} from "../posts/posts.service";
import { ChatsService } from '../chats/chats.service';
import {Profile} from "../chats/entities/profile";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(FriendRequest)
        private friendRequestRepository: Repository<FriendRequest>,

        @InjectRepository(Friendship)
        private friendshipRepository: Repository<Friendship>,

        private supabaseService: SupabaseService,

        private postsService: PostsService,

        private chatsService: ChatsService
    ) {}

    async findAll() {
        return await this.userRepository.find();
    }

    async createUser(name: string, email: string,id:string, username: string, imgUrl: string, description: string) {
        const user = new User();
        user.id = id;
        user.name = name;
        user.email = email;
        user.username = username;
        user.imgUrl = imgUrl;
        user.description = description;

        const newProfile: Profile = new Profile()
        newProfile.supabaseId = id;
        newProfile.username = username;
        newProfile.img = imgUrl;

        this.chatsService.addProfile(
            newProfile
        )
        return await this.userRepository.save(user);
    }

    async updateUser(name: string, username: string, imgUrl: string, description: string) {
        const user = await this.userRepository.findOne({where: {username}});
        if (!user) {
            throw new Error('User not found');
        }
        try {
            user.name = name;
            user.imgUrl = imgUrl;
            user.description = description;
            return await this.userRepository.save(user);
        }
        catch (error) {
            throw new Error('Failed to update user: ', error);
        }
    }

    async getFriends(userId: string) {

        const friendshipsA = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.friendshipsA', 'friendshipsA')
            .where('user.id = :id', { id: userId })
            .getOne();

        const friendshipsB = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.friendshipsB', 'friendshipsB')
            .where('user.id = :id', { id: userId })
            .getOne();

        if (!friendshipsA || !friendshipsB) {
            throw new Error('Friendships not found');
        }

        const friendsA = friendshipsA.friendshipsA.map((friendship) => friendship.userBEntity);
        const friendsB = friendshipsB.friendshipsB.map((friendship) => friendship.userAEntity);

        return [...friendsA, ...friendsB];
    }

    async sendFriendRequest(senderId: string, username: string) {

        const sender = await this.userRepository.findOne({where: {id: senderId}});
        if (!sender) {
            throw new Error('Sender not found');
        }
        const receiver = await this.userRepository.findOne({where: {username}});
        if (!receiver) {
            throw new Error('Receiver not found');
        }

        if (sender.id === receiver.id) {
            throw new Error('Cannot send friend request to yourself');
        }

        const checkFriendship = await this.friendshipRepository.findOne({where: {userAId: sender.id, userBId: receiver.id}});
        if (checkFriendship) {
            throw new Error('Already friends');
        }
        const checkFriendRequest = await this.friendRequestRepository.findOne({where: {senderId: sender.id, receiverId: receiver.id}});
        if (checkFriendRequest) {
            throw new Error('Friend request already sent');
        }

        const checkFriendRequest2 = await this.friendRequestRepository.findOne({where: {senderId: receiver.id, receiverId: sender.id}});
        if (checkFriendRequest2) {
            throw new Error('Friend request already sent');
        }

        const friendRequest = new FriendRequest();
        friendRequest.senderId = senderId;
        friendRequest.receiverId = receiver.id;
        return await this.friendRequestRepository.save(friendRequest);
    }

    async getFriendRequests(userId: string) {
        const friendRequests = await this.friendRequestRepository.find({where: {receiverId: userId}});
        return friendRequests;
    }

    async acceptFriendRequest(username: string, currentId: string) {
        const sender = await this.userRepository.findOne({where: {username}});
        if (!sender) {
            throw new Error('Sender not found');
        }

        const friendRequest = await this.friendRequestRepository.findOne({where: {senderId: sender.id, receiverId: currentId}});
        if (!friendRequest) {
            throw new Error('Request not found');
        }
        const newFriendship = new Friendship()
        newFriendship.userAId = friendRequest.senderId;
        newFriendship.userBId = friendRequest.receiverId;
        await this.friendshipRepository.save(newFriendship);
        await this.friendRequestRepository.delete(friendRequest);

    }

    async rejectFriendRequest(username: string, currentId : string) {
        const sender = await this.userRepository.findOne({where: {username}});
        if (!sender) {
            throw new Error('Sender not found');
        }

        const friendRequest = await this.friendRequestRepository.findOne({where: {senderId: sender.id,  receiverId: currentId}});
        if (!friendRequest) {
            throw new Error('Request not found');
        }
        await this.friendRequestRepository.delete(friendRequest);


    }

    async getPostsOfUser(username: string) {
        const user = await this.userRepository.findOne({where: {email: username}});
        if (!user) {
            throw new Error('User not found');
        }
        return await this.postsService.findPostsByUsername(username);
    }
}
