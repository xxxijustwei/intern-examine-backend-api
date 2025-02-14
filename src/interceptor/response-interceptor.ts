import { EXAPAY_CATEGORY, ResponseCode, getResponseMessage } from "../common";
import { createZodDto } from "@anatine/zod-nestjs";
import { BadRequestException, CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, catchError, map, throwError } from "rxjs";
import z from "zod";

export const getResponseDto = (dataSchema?: z.ZodSchema) => {
    return z.object({
        category: z.string(),
        code: z.string()
            .describe("0000 - Operating Successfully, 0001 - Empty Content, 0002 - Nothing Changed, 2000 - Operating Failed, 2001 - Illegal Parameters, 2002 - Unauthorized, 2003 - Forbidden, 2004 - Not Found, 2005 - Method Not Allowed, 2006 - Request Timeout, 3000 - System Error"),
        message: z.string().optional(),
        ...(dataSchema ? { data: dataSchema } : {}),
    })
}

export class CommonResponseDto extends createZodDto(getResponseDto()) { }

@Injectable()
export class ResponseInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next
            .handle()
            .pipe(
                map((res) => {
                    const { category, code, message, data } = res;
                    return {
                        category: category ?? EXAPAY_CATEGORY,
                        code: code,
                        message: message ?? getResponseMessage(code),
                        data: data ?? {}
                    };
                }),
                catchError((err) => {
                    if (err instanceof BadRequestException) {
                        return throwError(() => {
                            const e = err as any;
                            return new HttpException(
                                {
                                    category: EXAPAY_CATEGORY,
                                    code: ResponseCode.ILLEGAL_PARAMETERS,
                                    message: e.response.message[0].split(": ")[1],
                                },
                                e.status,
                                {
                                    cause: err
                                }
                            );
                        })
                    }
                    console.log(err);
                    return throwError(() => {
                        return new HttpException(
                            {
                                category: EXAPAY_CATEGORY,
                                code: ResponseCode.SYSTEM_ERROR,
                                message: err.response?.message ?? "System Error",
                            },
                            err.status,
                            {
                                cause: err
                            }
                        );
                    })
                })
            );
    }

}