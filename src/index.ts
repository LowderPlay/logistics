import dotenv from 'dotenv';
dotenv.config();
import {authMiddleware} from "./auth";
import {app, apiRouter} from "./routes";
import {requireDelivery} from "./delivery/delivery";


app.get('/', (req, res) => {
    res.send({
        hello: "world",
    });
});

apiRouter.get('/me', authMiddleware,
    (req, res) => {
    res.send({
        user: req.user
    });
});

apiRouter.post("/status",
    requireDelivery(undefined),
    (req, res) => {
        res.send(res.locals.delivery);
    });

