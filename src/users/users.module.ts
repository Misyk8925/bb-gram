import { Module } from '@nestjs/common';
import {UsersService} from "./users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entities/user";
import {FriendRequest} from "./entities/friendRequest";
import {Friendship} from "./entities/friendship";
import {SupabaseModule} from "../common/supabase/supabase.module";
import { UsersController } from './users.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, FriendRequest, Friendship]),
    SupabaseModule],

    providers: [UsersService],
    exports: [UsersService, TypeOrmModule],
    controllers: [UsersController]
})
export class UsersModule {}
