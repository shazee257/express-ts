import { NextFunction, Request, Response } from "express";
import { generateResponse } from "../../utils/helpers";

export const defaultHandler = (req: Request, res: Response, next: NextFunction) => {
    generateResponse(null, `Response from root API`, res);
}