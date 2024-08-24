import { Router } from "express";
import { fetchAllUsers, fetchUser } from "../controllers/user.controller";

export default class UserAPI {
    constructor(private readonly router: Router) {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.get('/', fetchAllUsers);
        this.router.get('/profile', fetchUser);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/user';
    }
}