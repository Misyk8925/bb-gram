import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
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
            return await this.chatModel
                .find({ $or: [{ user1_id: SenderId }, { user2_id: SenderId }] })
                .populate('profile')
                .populate('messages')
                .populate('lastMessage')
                .exec();
        } catch (error) {
            throw new Error(`Failed to fetch chats: ${error.message}`);
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
            if (profileWithName.supabaseId === user1_Id) {
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
                            messages: [],
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
                                $push: { messages: message },
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

    async markAllMessagesAsRead(userId: string): Promise<{ status: string; updatedMessagesCount: number; updatedChatsCount: number }> {
        try {
            const userChats = await this.getAll(userId);
            if (!userChats || userChats.length === 0) {
                return { status: 'No chats found for this user.', updatedMessagesCount: 0, updatedChatsCount: 0 };
            }

            const uniqueMessageObjectIds = new Set<string>(); // To store unique ObjectId strings to prevent duplicates

            userChats.forEach(chat => {
                // 1. Process messages in the chat.messages array
                if (chat.messages && chat.messages.length > 0) {
                    chat.messages.forEach(message => {
                        // Приводим message к типу, включающему _id, так как Message из entities/message.ts его не объявляет,
                        // но Mongoose документы его содержат.
                        const msgDoc = message as Message & { _id: Types.ObjectId };
                        // Ваш существующий console.log, немного измененный для ясности
                        console.log(`Checking message in chat.messages array: ${msgDoc._id}, isRead: ${msgDoc.isRead}, senderId: ${msgDoc.supabaseSenderId}, userId: ${userId}`);
                        if (msgDoc && msgDoc._id && !msgDoc.isRead && msgDoc.supabaseSenderId !== userId) {
                            uniqueMessageObjectIds.add(msgDoc._id.toString());
                        }
                    });
                }

                // 2. Process the chat.lastMessage
                // chat.lastMessage populated by getAll(), so it's a Message document.
                // _id is from Mongoose document, isRead and supabaseSenderId are from Message entity.
                const lastMessageDoc = chat.lastMessage as Message & { _id?: Types.ObjectId; isRead?: boolean; supabaseSenderId?: string };

                if (lastMessageDoc && lastMessageDoc._id &&
                    typeof lastMessageDoc.isRead === 'boolean' && // Ensure isRead is present
                    lastMessageDoc.supabaseSenderId) { // Ensure supabaseSenderId is present

                    console.log(`Checking message in chat.lastMessage: ${lastMessageDoc._id}, isRead: ${lastMessageDoc.isRead}, senderId: ${lastMessageDoc.supabaseSenderId}, userId: ${userId}`);
                    if (!lastMessageDoc.isRead && lastMessageDoc.supabaseSenderId !== userId) {
                        uniqueMessageObjectIds.add(lastMessageDoc._id.toString());
                    }
                }
            });

            // Convert unique string IDs from Set back to Types.ObjectId for the $in query
            const messageIdsToUpdate: Types.ObjectId[] = [];
            uniqueMessageObjectIds.forEach(idString => {
                messageIdsToUpdate.push(new Types.ObjectId(idString));
            });

            let updatedMessagesCount = 0;
            if (messageIdsToUpdate.length > 0) {
                const messageUpdateResult = await this.messageModel.updateMany(
                    { _id: { $in: messageIdsToUpdate } }, // Condition isRead and senderId already handled when populating messageIdsToUpdate
                    { $set: { isRead: true } }
                ).exec();
                updatedMessagesCount = messageUpdateResult.modifiedCount;
                console.log(`Messages update result: ${updatedMessagesCount} messages marked as read.`); // Добавлено логирование
            }

            const chatIdsToUpdate = userChats.map(chat => chat.id);
            let updatedChatsCount = 0;
            if (chatIdsToUpdate.length > 0) {
                const chatUpdateResult = await this.chatModel.updateMany(
                    { _id: { $in: chatIdsToUpdate }, unreadMessages: { $gt: 0 } },
                    { $set: { unreadMessages: 0 } }
                ).exec();
                updatedChatsCount = chatUpdateResult.modifiedCount;
            }

            return { status: 'All messages marked as read.', updatedMessagesCount, updatedChatsCount };
        } catch (error) {
            throw new Error(`Failed to mark messages as read: ${error.message}`);
        }
    }
}
