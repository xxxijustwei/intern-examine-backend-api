import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { CommonResponseDto } from '../../interceptor';
import { IgnoreAuth } from '../../guards/user-auth-guard';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    @IgnoreAuth()
    @ApiOperation({
        summary: 'root',
        operationId: 'root'
    })
    root() {
        return this.appService.hello();
    }

    @Get('/status')
    @IgnoreAuth()
    @ApiOperation({
        summary: 'status',
        operationId: 'status'
    })
    @ApiResponse({
        type: CommonResponseDto
    })
    getStatus() {
        return this.appService.getStatus();
    }
}
