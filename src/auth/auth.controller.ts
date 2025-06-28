import {Body, Controller, Get, HttpCode, HttpStatus, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {Post} from "@nestjs/common";
import {AuthDto} from "./dto/auth.dto";
import {UserAttributes} from "@supabase/supabase-js";
import {AuthGuard} from "../common/guards/auth-guard.guard";
import {CurrentUser} from "../common/decorators/CurrentUser.decorator";

@Controller('api/auth')

export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ){}

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() authDto: AuthDto) {
        const { email, password } = authDto;
        return this.authService.signUp(email, password);
    }

    @Post('signin')
    async signIn(@Body() authDto: AuthDto) {
        const { email, password } = authDto;
        return this.authService.signIn(email, password);
    }

    @Post('signout')
    async signOut() {
        return this.authService.signOut();
    }

    @Get('me')
    @UseGuards(AuthGuard)
    async getMe(@CurrentUser() user) {
        return this.authService.getMe(user.access_token);
    }

    @Post('refresh-token')
    async refreshToken(@Body() token: string) {
        return this.authService.refreshToken(token);
    }

    @Post('reset-password')
    async resetPassword(@Body() email: string) {
        return this.authService.resetPassword(email);
    }

    @Post('update-password')
    async updatePassword(@Body() userAttributes: UserAttributes) {
        return this.authService.updatePassword(userAttributes);
    }
}