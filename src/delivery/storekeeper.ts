import express from "express";
import prisma from "../db";
import {Delivery, DeliveryState, Storage, WeightUnit} from "@prisma/client";
import {requireDelivery, sendDelivery, updateDelivery} from "./delivery";
import {updateCheckpoint} from "./security";

export const storekeeperRouter = express.Router();

storekeeperRouter.get("/loading",
    async (req, res) => {
        res.send(await prisma.delivery.findMany({
            where: {
                state: DeliveryState.LOADING,
            }
        }));
    });

storekeeperRouter.get("/waiting",
    async (req, res) => {
        let deliveries = await prisma.delivery.findMany({
            where: {
                state: DeliveryState.WAITING,
            }
        });
        res.send(deliveries.map(delivery => ({
            ...delivery,
            weightUnit: delivery.weightUnit === WeightUnit.TONNE ? "тонна" : "килограмм"
        })));
    });

storekeeperRouter.post("/accept",
    requireDelivery(DeliveryState.WAITING),
    async (req, res, next) => {
        if (!Object.values(Storage).includes(req.body.storage))
            return res.status(400).send({error: "incorrect storage entry is passed"});

        res.locals.delivery = await prisma.delivery.update({
            where: {
                id: res.locals.delivery.id,
            },
            data: {
                storage: req.body.storage
            }
        });
        next();
    },
    updateDelivery(DeliveryState.LOADING), // LOADING
    async (req, res, next) => {
        const delivery: Delivery = res.locals.delivery;
        console.log(`TODO: Send notification to the driver (${delivery.truck}) to start loading at ${delivery.storage}`);
        next();
    },
    updateCheckpoint,
    sendDelivery)

storekeeperRouter.post("/loaded",
    requireDelivery(DeliveryState.LOADING),
    updateDelivery(DeliveryState.COMPLETED),
    (req, res, next) => {
        const delivery: Delivery = res.locals.delivery;
        console.log(`Order ${delivery.id} is completed`);
        next();
    },
    sendDelivery)