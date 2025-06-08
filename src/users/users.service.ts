import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user";
import {Repository} from "typeorm";
import {SupabaseService} from "../common/supabase/supabase.service";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,


        private supabaseService: SupabaseService,
    ) {}

    async findAll() {
        return await this.userRepository.find();
    }

    async createUser(name: string, email: string, username: string, imgUrl: string, description: string) {
        const user = new User();
        user.name = name;
        user.email = email;
        user.username = username;
        user.imgUrl = imgUrl;
        user.description = description;
        return await this.userRepository.save(user);
    }
}
