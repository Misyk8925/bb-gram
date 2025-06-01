import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Chat } from "./entities/chat";
import {Profile} from "./entities/profile";
import {Message} from "./entities/message";

@Injectable()
export class ChatsService {
    constructor(
        @InjectModel('Chat') private chatModel: Model<Chat>,
        @InjectModel('Profile') private profileModel: Model<Profile>,
        @InjectModel('Message') private messageModel: Model<Message>,
    ) {}

    async getAll(): Promise<Chat[]> {
        try {
            return await this.chatModel.find().exec();
        } catch (error) {
            throw new Error('Failed to fetch chats');
        }
    }

    async getChatWithUser(username: string): Promise<Chat> {
        try {
            const profileWithName = await this.profileModel.findOne({ name: username }).exec();
            if (!profileWithName) {
                throw new Error('Profile not found');
            }
            const chatWithProfile = await this.chatModel.findOne({ profile: profileWithName._id }).exec();
            if (!chatWithProfile) {
                throw new Error('Chat not found');
            }
            return chatWithProfile;
        } catch (error) {
            throw new Error('Failed to fetch chat');
        }
    }

    async sendMessage(username: string, text: string): Promise<Chat> {
        try {
            const profileWithName = await this.profileModel.findOne({ name: username }).exec();
            if (!profileWithName) {
                throw new Error('Profile not found');
            }
            const message = new this.messageModel({ text, createdAt: new Date() });
            await message.save();
            const chatWithProfile = await this.chatModel.findOne({ profile: profileWithName._id }).exec();
            if (!chatWithProfile) {
                throw new Error('Chat not found');
            }
            chatWithProfile.lastMessage = message;
            chatWithProfile.unreadMessages++;
            await chatWithProfile.save();
            return chatWithProfile;
        } catch (error) {
            throw new Error('Failed to send message');
        }
    }
}
