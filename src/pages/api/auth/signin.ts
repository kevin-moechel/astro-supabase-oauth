import type { Provider } from "@supabase/supabase-js";
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
    const formData = await request.formData();
    const provider = formData.get("provider")?.toString();

    if (provider) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider as Provider,
            options: {
                redirectTo: import.meta.env.DEV
                    ? "http://localhost:4321/api/auth/callback"
                    : import.meta.env.SUPABASE_AUTH_CALLBACK_URL,
            },
        });

        if (error) {
            return new Response(error.message, { status: 500 });
        }

        return redirect(data.url);
    }

    return redirect("/app/loggedin");
};
