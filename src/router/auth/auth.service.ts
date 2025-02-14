import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResponseCode } from '../../common';
import { SigninDto } from './types';
import { Request } from 'express';
import { throwUnauthorizedException } from '../../guards';

const user = [
    {
        email: "test@gmail.com",
        password: "12345678",
        username: "test",
        bio: "Where is my bio? :D"
    }
];


@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
    ) { }

    private refreshToken: string[] = [];

    getUser(email: string) {
        return user.find(u => u.email === email);
    }

    async signin({ email, password }: SigninDto) {
        const user = this.getUser(email);
        if (!user) {
            return {
                code: ResponseCode.NOT_FOUND,
                message: "unregistered user",
            }
        }

        if (password !== user.password) {
            return {
                code: ResponseCode.FORBIDDEN,
                message: "wrong password",
            }
        }

        const { accessToken, refreshToken } = await this.generateToken(email);
        this.refreshToken.push(refreshToken);
        const { password: pwd, ...userInfo } = user;

        return {
            code: ResponseCode.OPERATING_SUCCESSFULLY,
            data: {
                ...userInfo,
                token: {
                    accessToken,
                    refreshToken
                }
            }
        }
    }

    async getUserInformation(email: string) {
        const user = this.getUser(email);
        if (!user) {
            return {
                code: ResponseCode.NOT_FOUND,
                message: "User not found",
            }
        }
        const { password, ...userInfo } = user;
        return {
            code: ResponseCode.OPERATING_SUCCESSFULLY,
            data: userInfo
        }
    }

    async refreshAccessToken(req: Request) {
        const token = this.extractTokenFromHeader(req);
        if (!token) {
            throwUnauthorizedException();
            return false;
        }

        if (!this.refreshToken.includes(token!)) {
            return {
                code: ResponseCode.UNAUTHORIZED,
                message: "Unknown Refresh Token"
            }
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, { secret: "REFRESH>JWT>SECRET" });
            const email = payload.email;

            const { accessToken } = await this.generateToken(email);
            return {
                code: ResponseCode.OPERATING_SUCCESSFULLY,
                data: {
                    accessToken
                }
            }
        } catch (e) {
            throwUnauthorizedException(e.message);
            return false;
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    private async generateToken(email: string) {
        const payload = {
            email
        }
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                payload,
                { secret: "ACCESS>JWT>SECRET", expiresIn: '60s' }
            ),
            this.jwtService.signAsync(
                payload,
                { secret: "REFRESH>JWT>SECRET", expiresIn: '7d' }
            )
        ]);

        return {
            accessToken,
            refreshToken
        }
    }

}