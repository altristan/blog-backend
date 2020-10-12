import {ConflictException, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {User} from "./interfaces/user.interface";
import {Model} from "mongoose";
import {AuthCredentialsDto} from "./dto/auth-credentials.dto";
import * as bcrypt from 'bcrypt';
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(@InjectModel('User')
                private userModel: Model<User>,
                private jwtService: JwtService
    ) {
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const {username, password} = authCredentialsDto;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new this.userModel({username, password: hashedPassword});

        try {
            await user.save();
        } catch (err) {
            if (err.code === 11000) {
                throw new ConflictException('User already exists');
            }
            throw err;
        }
    }

    async signIn(user: User) {
        const payload = {username: user.username, sub: user._id};
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async validateUser(username: string, pass: string): Promise<User> {
        const user = await this.userModel.findOne({username});

        if (!user) {
            return null;
        }

        const valid = await bcrypt.compare(pass, user.password);

        if (valid) {
            return user;
        }

        return null;
    }
}
