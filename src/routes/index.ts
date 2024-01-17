import { Request, Response, NextFunction, Application, Router } from "express";
import RootAPI from "./root/root.route";

export default class API {
    router: Router;
    routeGroups: any[];

    constructor(private readonly app: Application) {
        this.router = Router();
        this.routeGroups = [];
    }

    loadRouteGroups() {
        const router = this.router;
        this.routeGroups.push(new RootAPI(router));
    }

    setContentType(req: Request, res: Response, next: NextFunction) {
        res.set("Content-Type", "application/json");
        next();
    }

    registerGroups() {
        this.loadRouteGroups();
        this.routeGroups.forEach((rg) => {
            console.log("Route group: " + rg.getRouterGroup());
            this.app.use("/api" + rg.getRouterGroup(), this.setContentType, rg.getRouter());
        });
    }
}