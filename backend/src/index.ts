import bun from "bun";
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { openapi } from "@elysiajs/openapi";

const connectionString = `${bun.env.DATABASE_URL}`;

const ALLCHARACTERS = bun.env.ALLCHARACTERS!;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const randomstr = async () => {
    const a = ALLCHARACTERS[Math.floor(Math.random() * ALLCHARACTERS.length)];
    // console.log(a);
    const w = await prisma.users.findUnique({
        where: { character: a },
    });
    if (w) {
        return await randomstr();
    }
    return a;
};

const cache = new Map<string, string>();

const app = new Elysia()
    .use(openapi())
    .use(cors())
    .get("/", () => "Hello API")
    .post(
        "/login",
        async ({ body: { id } }) => {
            const data = await prisma.users.upsert({
                where: {
                    id,
                },
                create: {
                    id,
                },
                update: {},
            });

            return {
                success: true,
                data,
            };
        },
        {
            body: t.Object({
                id: t.String({ maxLength: 5, minLength: 5 }),
            }),
        },
    )
    .get("/getcount", async () => {
        const alo = await prisma.users.count({
            where: {
                character: { not: null },
            },
        });

        return ALLCHARACTERS.length - alo;
    })
    .post(
        "/random",
        async ({ body: { id } }) => {
            const w = await randomstr();
            const e = await prisma.users.findUnique({
                where: {
                    id,
                    character: undefined,
                },
            });
            if (!e)
                return {
                    success: false,
                    data: "u already random.",
                };
            await prisma.users.update({
                where: {
                    id,
                },
                data: {
                    character: w,
                },
            });
            return {
                success: true,
                data: w,
            };
        },
        {
            body: t.Object({
                id: t.String({ maxLength: 5, minLength: 5 }),
            }),
        },
    )
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
