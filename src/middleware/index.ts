import { defineMiddleware } from "astro:middleware";
import micromatch from "micromatch";
import { supabase } from "../lib/supabase";

const protectedRoutes = ["/app/**"];

export const onRequest = defineMiddleware(
    async ({ url, cookies, redirect }, next) => {
        if (micromatch.isMatch(url.pathname, protectedRoutes)) {
            const accessToken = cookies.get("sb-access-token");
            const refreshToken = cookies.get("sb-refresh-token");

            if (!accessToken || !refreshToken) {
                return redirect("/");
            }

            const { data, error } = await supabase.auth.setSession({
                refresh_token: refreshToken.value,
                access_token: accessToken.value,
            });

            if (error) {
                cookies.delete("sb-access-token", {
                    path: "/",
                });
                cookies.delete("sb-refresh-token", {
                    path: "/",
                });
                return redirect("/");
            }

            cookies.set("sb-access-token", data?.session?.access_token!, {
                sameSite: "strict",
                path: "/",
                secure: true,
            });
            cookies.set("sb-refresh-token", data?.session?.refresh_token!, {
                sameSite: "strict",
                path: "/",
                secure: true,
            });
        }

        return next();
    }
);
