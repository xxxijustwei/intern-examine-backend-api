import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IRequest } from '@/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AccessTokenDto, SigninDto, UserInfoDto } from './types';
import { IgnoreAuth } from '@/guards/user-auth-guard';
import { Request } from 'express';

@Controller('api/auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    @Post("signin")
    @IgnoreAuth()
    @ApiOperation({
        summary: 'Sign-in',
        operationId: 'signin'
    })
    @ApiCreatedResponse({ type: UserInfoDto })
    signin(@Body() data: SigninDto) {
        return this.authService.signin(data);
    }

    @Post("refresh-token")
    @IgnoreAuth()
    @ApiOperation({
        summary: 'Refresh access token',
        operationId: 'refresh-access-token'
    })
    @ApiCreatedResponse({ type: AccessTokenDto })
    refreshAccessToken(@Req() req: Request) {
        return this.authService.refreshAccessToken(req);
    }

    @Get("user-info")
    @ApiOperation({
        summary: 'Get user information',
        operationId: 'get-user-info'
    })
    @ApiOkResponse({ type: UserInfoDto })
    getUserInfo(@Req() req: IRequest) {
        const { email } = req;
        return this.authService.getUserInformation(email);
    }
}
