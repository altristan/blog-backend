import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";
import {UserSchema} from "./schema/user.schema";
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {LocalStrategy} from "./strategies/local.strategy";
import {JwtStrategy} from "./strategies/jwt-auth.strategy";

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
        PassportModule,
        // JwtModule.register({}),
        JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME},
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule {
}
