import {Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {SupabaseService} from "../common/supabase/supabase.service";
import {UserAttributes} from "@supabase/supabase-js";

@Injectable()
export class AuthService {
    private readonly logger = new Logger('AuthService');

    constructor(private supabaseService: SupabaseService) {}

    async signUp(email: string, password: string){

        const {data, error} = await this.supabaseService
            .getClient()
            .auth.signUp({
            email,
            password,
        });

        this.logger.log(`User signed up: ${data}`);

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return data;
    }

    async signIn(email:string, password: string){
        const {data, error} = await this.supabaseService
            .getClient()
            .auth.signInWithPassword({
            email,
            password,
        });

        this.logger.log(`User signed in: ${data}`);

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return data;
    }

    async signOut(){
        const {error} = await this.supabaseService
            .getClient()
            .auth.signOut();

        this.logger.log(`User signed out`);

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return {message: 'User signed out'};
    }

    async getMe(token:string){
        const {data, error} = await this.supabaseService
            .getClient()
            .auth.getUser(token);

        this.logger.log(`User retrieved: ${data}`);

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        const meData = {
            user: data.user
        }

        const extractMeData = (data: typeof meData) => {
            if (!data.user) {
                throw new UnauthorizedException('User not found');
            }

            const {email, role, last_sign_in_at} = data.user;
            const created_at = data.user.identities?.[0]?.created_at;

            if (!email || !role || !last_sign_in_at || !created_at) {
                throw new UnauthorizedException('User not found');
            }

            return {
                email,
                role,
                last_sign_in_at,
                created_at,
            }
        }
        return extractMeData(meData);
    }

    async refreshToken(token: string){
        const {data, error} = await this.supabaseService
            .getClient()
            .auth.refreshSession({refresh_token: token});

        this.logger.log(`User refreshed: ${data}`);

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return data;
    }

    async resetPassword(email: string) {
        const {data, error} = await this.supabaseService
            .getClient()
            .auth.resetPasswordForEmail(email);

        this.logger.log(`User reset password: ${data}`);

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return data;
    }

    async updatePassword(userAttributes: UserAttributes) {


        const {data, error} = await this.supabaseService
            .getClient()
            .auth.updateUser(userAttributes);

        this.logger.log(`User updated password: ${data}`);

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        return data;
    }
}


