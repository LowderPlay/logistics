import express, {NextFunction, Request, Response} from "express";
import prisma from "../db";
import {Delivery, DeliveryState, WeightUnit} from "@prisma/client";
import {requireDelivery, sendDelivery, sortByUsability, updateDelivery} from "./delivery";

const MAX_WAITING_TRUCKS = 4;
const MAX_CHECKING_TRUCKS = 2;
export const securityRouter = express.Router();

securityRouter.get("/checking",
    async (req, res) => {
    const deliveries = await prisma.delivery.findMany({
        where: {
            state: DeliveryState.CHECKPOINT
        }
    });
    res.send(deliveries.map(delivery => ({
        ...delivery,
        weightUnit: delivery.weightUnit === WeightUnit.TONNE ? "тонна" : "килограмм"
    })));
});

securityRouter.get("/queued",
    async (req, res) => {
    const deliveries = await prisma.delivery.findMany({
        where: {
            state: DeliveryState.ARRIVED
        }
    });
    res.send(deliveries.map(delivery => ({
        ...delivery,
        weightUnit: delivery.weightUnit === WeightUnit.TONNE ? "тонна" : "килограмм"
    })));
});

securityRouter.post("/arrived",
    requireDelivery(DeliveryState.SCHEDULED),
    updateDelivery(DeliveryState.ARRIVED, {changeTime: true}),
    updateCheckpoint,
    sendDelivery);

export async function updateCheckpoint(req: Request, res: Response, next: NextFunction) {
    const waitingTrucks = await prisma.delivery.count({
        where: {
            state: DeliveryState.WAITING,
        }
    });
    const checkingTrucks = await prisma.delivery.findMany({
        where: {
            state: DeliveryState.CHECKPOINT,
        }
    });

    console.log(`checkpoint: ${checkingTrucks.length}, internal lot: ${waitingTrucks}`);
    if (waitingTrucks >= MAX_WAITING_TRUCKS ||
        checkingTrucks.length >= MAX_CHECKING_TRUCKS) return next();

    let queue = await prisma.delivery.findMany({
        where: {
            state: DeliveryState.ARRIVED
        }
    });

    if (queue.length < 1) return next();

    queue = sortByUsability(queue, checkingTrucks);
    // console.log("sorted:", queue);
    let readyTrucks = queue.slice(0, Math.min(MAX_CHECKING_TRUCKS - checkingTrucks.length, queue.length));
    console.log("best:", readyTrucks)
    await prisma.delivery.updateMany({
        where: {
            id: {in: readyTrucks.map(delivery => delivery.id)},
        },
        data: {
            state: DeliveryState.CHECKPOINT,
        }
    });
    next();
}

// securityRouter.post("/accept",
//     requireDelivery(DeliveryState.ARRIVED),
//     updateDelivery(DeliveryState.CHECKPOINT),
//     (req, res) => {
//         const delivery: Delivery = res.locals.delivery;
//         console.log(`TODO: Send notification to the driver (${delivery.truck}) to go through security checkpoint`);
//     });

securityRouter.post("/checkpoint",
    requireDelivery(DeliveryState.CHECKPOINT),
    updateDelivery(DeliveryState.WAITING),
    updateCheckpoint,
    sendDelivery);

securityRouter.post("/reject",
    requireDelivery(DeliveryState.CHECKPOINT),
    updateDelivery(DeliveryState.ARRIVED, {lowPriority: true}),
    updateCheckpoint,
    sendDelivery);