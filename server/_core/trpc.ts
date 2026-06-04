import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { User } from "../../drizzle/schema";
import type { TrpcContext } from "./context";
import { ENV } from "./env";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const localDevUser: User = {
  id: 0,
  openId: "local-dev",
  name: "Desarrollo local",
  email: null,
  loginMethod: "local",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const canBypassAuthForLocalDev = () =>
  process.env.NODE_ENV === "development" && !ENV.oAuthServerUrl;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;
  const user = ctx.user ?? (canBypassAuthForLocalDev() ? localDevUser : null);

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
