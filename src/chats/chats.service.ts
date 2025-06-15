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

    async getAll(SenderId: string): Promise<Chat[]> {
        try {
            return await this.chatModel.find({senderId: SenderId}).exec();
        } catch (error) {
            throw new Error('Failed to fetch chats', error);
        }
    }

    async getChatWithUser(senderId: string, username: string) {
        try {
            const profileWithName = await this.profileModel.findOne({ name: username }).exec();
            if (!profileWithName) {
                throw new Error('Profile not found');
            }
            return await this.chatModel.findOne({ senderId, receiverId: profileWithName._id }).exec();
        } catch (error) {
            throw new Error('Failed to fetch chat');
        }
    }

    async sendMessage(username: string, text: string, user1_Id: string): Promise<Chat> {
        try {
            // Проверка входных параметров
            if (!username || !text || !user1_Id) {
                throw new Error('Missing required parameters: username, text, or user ID');
            }

            // Находим профиль получателя по имени
            const profileWithName = await this.profileModel.findOne({ username: username }).exec();
            if (!profileWithName) {
                throw new Error(`Profile with username "${username}" not found`);
            }

            // Проверка, что пользователь не отправляет сообщение самому себе
            if (profileWithName.id === user1_Id) {
                throw new Error('Cannot send message to yourself');
            }

            try {
                // Ищем существующий чат между пользователями
                let chatWithProfile = await this.chatModel.findOne({
                    user1_id: user1_Id,
                    user2_id: profileWithName.supabaseId
                }).exec();

                console.log('Profile fields:', Object.keys(profileWithName));
                console.log('Profile ID:', profileWithName.id);
                console.log('Profile supabaseId:', profileWithName.supabaseId);
                console.log('Profile _id:', profileWithName._id);

                // Если чат не найден, проверяем в обратном порядке
                if (!chatWithProfile) {
                    chatWithProfile = await this.chatModel.findOne({
                        user1_id: profileWithName.id,
                        user2_id: user1_Id
                    }).exec();
                }

                // Создаем новое сообщение
                let message;
                try {
                    const senderProfile = await this.profileModel.findOne({ supabaseId: user1_Id }).exec();
                    if (!senderProfile) {
                        throw new Error(`Sender profile with id "${user1_Id}" not found`);
                    }
                    message = new this.messageModel({
                        text,
                        createdAt: new Date(),
                        sender: senderProfile._id,
                        supabaseSenderId: user1_Id,
                        isRead: false
                    });
                    await message.save();
                } catch (messageError) {
                    throw new Error(`Failed to create message: ${messageError.message}`);
                }

                // Если чат не найден, создаем новый
                if (!chatWithProfile) {
                    try {
                        chatWithProfile = new this.chatModel({
                            user1_id: user1_Id,
                            user2_id: profileWithName.supabaseId,
                            profile: profileWithName._id,
                            messages: [message._id],
                            lastMessage: message._id,
                            unreadMessages: 1
                        });
                    } catch (chatError) {
                        // Удаляем созданное сообщение, если не удалось создать чат
                        await this.messageModel.findByIdAndDelete(message._id).exec();
                        throw new Error(`Failed to create chat: ${chatError.message}`);
                    }
                } else {
                    // Обновляем существующий чат
                    try {
                        // Альтернативное решение с использованием Mongoose update
                        await this.chatModel.findByIdAndUpdate(
                            chatWithProfile._id,
                            {
                                $push: { messages: message._id },
                                $set: { lastMessage: message._id },
                                $inc: { unreadMessages: 1 }
                            }
                        );
                    } catch (updateError) {
                        // Удаляем созданное сообщение, если не удалось обновить чат
                        await this.messageModel.findByIdAndDelete(message._id).exec();
                        throw new Error(`Failed to update chat: ${updateError.message}`);
                    }
                }

                // Сохраняем чат
                try {
                    console.log('Chat fields:', chatWithProfile);
                    await chatWithProfile.save();
                    return chatWithProfile;
                } catch (saveError) {
                    // Удаляем созданное сообщение, если не удалось сохранить чат
                    await this.messageModel.findByIdAndDelete(message._id).exec();
                    throw new Error(`Failed to save chat: ${saveError.message}`);
                }
            } catch (chatOperationError) {
                throw new Error(`Chat operation failed: ${chatOperationError.message}`);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Логируем ошибку с полным стеком для отладки
            console.error(error.stack);
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    async addProfile(profile: Profile): Promise<Profile> {
        try {
            const newProfile = new this.profileModel(profile);
            return await newProfile.save();
        } catch (error) {
            throw new Error('Failed to add profile');
        }
    }
}
