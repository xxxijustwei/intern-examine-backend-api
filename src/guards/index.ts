import { EXAPAY_CATEGORY, ResponseCode, getResponseMessage } from "@/common";
import { HttpException } from "@nestjs/common";

export { UserAuthGuard } from "./user-auth-guard";

export const throwUnauthorizedException = (message?: string) => {
    throw new HttpException(
        {
            category: EXAPAY_CATEGORY,
            code: ResponseCode.UNAUTHORIZED,
            message: message ?? getResponseMessage(ResponseCode.UNAUTHORIZED),
        },
        200,
        {
            cause: ""
        }
    );
}