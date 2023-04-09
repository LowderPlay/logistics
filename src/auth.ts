import {Role, User} from "@prisma/client";
import passport from 'passport';
import {Strategy as BearerStrategy} from "passport-http-bearer";
import prisma from "./db";
import {Strategy as CustomStrategy} from "passport-custom";
import bcrypt from "bcrypt";
import * as crypto from "crypto";
import express from "express";

type ExpressUser = User;

declare global {
    namespace Express {
        interface User extends ExpressUser {}
    }
}

passport.use('token',
    new BearerStrategy(
        async (userToken, done) => {
            const token = await prisma.accessToken.findFirst({
                where: {
                    token: userToken,
                }
            });
            if (token === null) return done(null, false);
            const user = await prisma.user.findFirst({
                where: {
                    id: token.userId
                }
            });
            if (user === null) return done(null, false);
            done(null, user);
        }
    ));

passport.use('body',
    new CustomStrategy(
        async (req, done) => {
            if (!req.body.hasOwnProperty("username") ||
                !req.body.hasOwnProperty("password"))
                return done(null, false);
            const user = await prisma.user.findFirst({
                where: {
                    email: req.body.username,
                }
            });
            if (user === null) return done(null, false);
            if (await bcrypt.compare(req.body.password, user.password)) {
                done(null, user);
            } else {
                done(null, false);
            }
        }
    ));

export const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    if (!req.body.hasOwnProperty("username") ||
        !req.body.hasOwnProperty("password"))
        return res.status(400).send({error: "username or password not specified"});
    if (!Object.values(Role).includes(req.body.role))
        return res.status(400).send({error: "incorrect role is passed"});

    const password = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
        data: {
            email: req.body.username,
            password,
            role: req.body.role
        }
    })
    res.send({id: user.id});
});

authRouter.post("/login",
    passport.authenticate("body", {session: false}),
    async (req, res) => {
    if(!req.user) return res.sendStatus(500);
    const tokenString = crypto.randomBytes(64).toString('hex');
    const token = await prisma.accessToken.create({
        data: {
            token: tokenString,
            userId: req.user.id,
        }
    });
    res.send({
        token: token.token,
        role: req.user.role,
    });
});

export const authMiddleware = passport.authenticate("token", { session: false });