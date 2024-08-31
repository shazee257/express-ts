import { Router } from "express";
import { fetchAllUsers, fetchUser } from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { ROLES } from "../utils/constants";

export default class UserAPI {
    constructor(private readonly router: Router) {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.get('/', authMiddleware(Object.values(ROLES)), fetchAllUsers);
        this.router.get('/profile', authMiddleware(Object.values(ROLES)), fetchUser);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/user';
    }
}