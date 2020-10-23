import {ConflictException, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {User} from "./interfaces/user.interface";
import {Model} from "mongoose";
import {RegisterDto} from "./dto/register.dto";
import * as bcrypt from 'bcrypt';
import {JwtService} from "@nestjs/jwt";
import TokenPayload from "./interfaces/tokenPayload.interface";

@Injectable()
export class AuthService {
    constructor(@InjectModel('User')
                private userModel: Model<User>,
                private jwtService: JwtService
    ) {
    }

    async signUp(registerDto: RegisterDto): Promise<void> {
        const {username, email, password} = registerDto;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new this.userModel({username, email, password: hashedPassword});

        try {
            await user.save();
        } catch (err) {
            if (err.code === 11000) {
                throw new ConflictException('User/email already exists');
            }
            throw err;
        }
    }

    async signIn(user: User) {
        // console.log(user);
        const payload = {sub: user._id};
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async validateUser(username: string, pass: string): Promise<User> {
        const user = await this.userModel.findOne({username});
        // console.log(user);

        if (!user) {
            return null;
        }

        const valid = await bcrypt.compare(pass, user.password);

        if (valid) {
            return user;
        }

        return null;
    }

    async getUser(userID: string): Promise<User> {
        const user = await this.userModel.findById(userID).exec();

        console.log(user);
        return user;
    }

    public getCookieWithJwtAccessToken(userId: number) {
        const payload: TokenPayload = {userId};
        const token = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME
        })
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${
            process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}`;
    }

    public getCookieWithJwtRefreshToken(userId: number) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_TOKEN_SECRET,
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME
        });
        const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${
            process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME}`;
        return {
            cookie,
            token
        }
    }
}
