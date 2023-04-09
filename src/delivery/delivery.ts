import {Delivery, DeliveryState} from "@prisma/client";
import {NextFunction, Request, Response} from "express";
import prisma from "../db";

export function requireDelivery(requiredState: DeliveryState | undefined) {
    return async function (req: Request, res: Response, next: NextFunction) {
        if (!req.body.hasOwnProperty("id"))
            return res.status(400).send({error: "id is not specified"});

        let delivery = await prisma.delivery.findFirst({
            where: {
                id: req.body.id,
                state: requiredState
            }
        });
        if (delivery === null)
            return res.status(404).send({error: "delivery not found"});

        res.locals.delivery = delivery;
        next();
    }
}

export function updateDelivery(newState: DeliveryState, {changeTime = false, lowPriority = false} = {}) {
    return async function (req: Request, res: Response, next: NextFunction) {
        if (lowPriority) {
            await prisma.delivery.updateMany({
                where: {
                    lowPriority: true,
                },
                data: {
                    lowPriority: false,
                }
            })
        }
        const delivery = await prisma.delivery.update({
            where: {
                id: res.locals.delivery.id,
            },
            data: {
                state: newState,
                lowPriority,
                ...(changeTime ? {
                    updateTime: new Date()
                } : {}),
            }
        });
        res.locals.delivery = delivery;
        next()
    }
}

export function sortByUsability(inputDeliveries: Delivery[], checkpoint: Delivery[]): Delivery[] {
    const deliveries = inputDeliveries.filter(delivery => !delivery.lowPriority);
    deliveries.sort((a, b) => {
        return (a.updateTime?.getTime() || 0)  - (b.updateTime?.getTime() || 0);
    });
    const groups: {[key: string]: Delivery[]} = {};
    for (const delivery of deliveries) {
        if(!groups.hasOwnProperty(delivery.stockType)) groups[delivery.stockType] = [];
        groups[delivery.stockType].push(delivery);
    }

    const keys = Object.keys(groups);
    keys.sort((a,b) => {
        return groups[a].length - groups[b].length;
    });

    const takenKeys = [];
    for (const delivery of checkpoint) {
        if(keys.includes(delivery.stockType)) {
            takenKeys.push(...keys.splice(keys.indexOf(delivery.stockType), 1))
        }
    }
    console.log(takenKeys);
    keys.push(...takenKeys);

    const groupedDeliveries = keys.map(key => groups[key]);

    const sorted: Delivery[] = [];
    while (groupedDeliveries.flat().length > 0) {
        for (const deliveryGroup of groupedDeliveries) {
            const first = deliveryGroup.shift();
            if(first) sorted.push(first);
        }
    }

    sorted.push(...inputDeliveries.filter(delivery => delivery.lowPriority));
    return sorted;
}
export function sendDelivery(req: Request, res: Response, next: NextFunction) {
    res.send(res.locals.delivery);
    next();
}
