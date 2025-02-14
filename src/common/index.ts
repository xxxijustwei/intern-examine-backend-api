import { Request } from "express";

export { EXAPAY_CATEGORY, ResponseCode, getResponseMessage } from "./response-code";

export interface IRequest extends Request {
    email: string;
    token?: string;
}