import { getResponseDto } from "../../interceptor/response-interceptor";
import { createZodDto } from "@anatine/zod-nestjs";
import z from "zod";

export class SigninDto extends createZodDto(
    z.object({
        email: z.string()
            .email({
                message: "Invalid email address"
            })
            .describe("Email address"),
        password: z.string()
            .min(8, {
                message: "Password must be at least 8 characters"
            })
            .describe("Password"),
    })
) { }

export class UserInfoDto extends createZodDto(getResponseDto(
    z.object({
        email: z.string().describe("Email address"),
        username: z.string().describe("Username"),
        bio: z.string().describe("Bio"),
        token: z.object({
            accessToken: z.string().describe("Access Token"),
            refreshToken: z.string().describe("Refresh Token"),
        }),
    })
)) { }

export class AccessTokenDto extends createZodDto(getResponseDto(
    z.object({
        accessToken: z.string().describe("Access Token"),
    })
)) { }