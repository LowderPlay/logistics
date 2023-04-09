import express, {Express} from "express";
import bodyParser from "body-parser";
import {authMiddleware, authRouter} from "./auth";
import {Role} from "@prisma/client";
import passport from "passport";
import {storekeeperRouter} from "./delivery/storekeeper";
import {securityRouter} from "./delivery/security";
import {requireDelivery} from "./delivery/delivery";
import cors from "cors";

export const app: Express = express();

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT;

export const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/security",
    authMiddleware,
    (req, res, next) => {
        if(req.user?.role === Role.SECURITY) next();
    },
    securityRouter
);
apiRouter.use("/storekeeper",
    authMiddleware,
    (req, res, next) => {
        if(req.user?.role === Role.STOREKEEPER) next();
    },
    storekeeperRouter
);

app.use("/api", apiRouter);

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})