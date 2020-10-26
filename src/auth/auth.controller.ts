import {Body, Controller, Get, HttpStatus, Post, Request, Res, UseGuards, ValidationPipe} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {RegisterDto} from "./dto/register.dto";
import {LocalAuthGuard} from "./guards/local-auth.guard";
import {JwtAuthGuard} from "./guards/jwt-auth.guard";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {

    }

    @Post('/signup')
    async signUp(
        @Body(ValidationPipe) registerDto: RegisterDto): Promise<void> {
        return await this.authService.signUp(registerDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('/signin')
    async signIn(@Request() req) {
        return this.authService.signIn(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/me')
    getMe(@Request() req) {
        return this.authService.getUser(req.user);
    }

    // Fetch all users
    @Get('users')
    async getPosts(@Res() res) {
        const posts = await this.authService.getUsers();
        return res.status(HttpStatus.OK).json(posts);
    }
}
