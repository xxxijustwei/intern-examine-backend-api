import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { throwUnauthorizedException } from '.';

export const IS_PUBLIC_KEY = 'isPublic';
export const IgnoreAuth = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class UserAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throwUnauthorizedException();
            return false;
        }

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                { secret: "ACCESS>JWT>SECRET" }
            );
            request['email'] = payload['email'];
            request['token'] = token;
        } catch (e) {
            throwUnauthorizedException(e.message);
            return false;
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}