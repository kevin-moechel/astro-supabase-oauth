import type { Provider } from "@supabase/supabase-js";
import {
    ActionError,
    defineAction,
    type ActionAPIContext,
} from "astro:actions";
import { z } from "astro:schema";
import { supabase } from "../lib/supabase";

export const server = {
    signinOAuth: defineAction({
        accept: "form",
        input: z.object({
            provider: z.string().min(1, "No social auth provided"),
        }),
        handler: async ({ provider }) => {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider as Provider,
                options: {
                    redirectTo: import.meta.env.DEV
                        ? "http://localhost:4321/api/auth/callback"
                        : import.meta.env.SUPABASE_AUTH_CALLBACK_URL,
                },
            });

            if (error) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message,
                });
            }
            console.log(data.url);
            return data.url;
        },
    }),

    signOut: defineAction({
        accept: "form",
        handler: async ({}, ctx: ActionAPIContext) => {
            ctx.cookies.delete("sb-access-token", { path: "/" });
            ctx.cookies.delete("sb-refresh-token", { path: "/" });
            supabase.auth.signOut();
        },
    }),
};
