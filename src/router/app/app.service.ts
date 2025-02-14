import { ResponseCode } from '../../common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

    hello() {
        return {
            code: ResponseCode.OPERATING_SUCCESSFULLY,
            message: 'API is running'
        };
    }

    getStatus() {
        return {
            code: ResponseCode.OPERATING_SUCCESSFULLY
        };
    }
}
