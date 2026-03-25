import { Client } from "@heroiclabs/nakama-js";

let client: Client | null = null;

export function getClient(): Client {
    if (!client) {
        client = new Client(
            process.env.NEXT_PUBLIC_NAKAMA_SERVER_KEY ?? "defaultkey",
            process.env.NEXT_PUBLIC_NAKAMA_HOST ?? "localhost",
            process.env.NEXT_PUBLIC_NAKAMA_PORT,
            Boolean(process.env.NEXT_PUBLIC_NAKAMA_USE_SSL) || false
        );
    }
    return client;
}