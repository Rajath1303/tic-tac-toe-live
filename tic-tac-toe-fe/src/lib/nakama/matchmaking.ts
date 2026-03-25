import { Socket } from "@heroiclabs/nakama-js";

export async function joinMatchmaker(socket: Socket): Promise<string> {
    const ticket = await socket.addMatchmaker("*", 2, 2, {});
    return ticket.ticket;
}

export async function leaveMatchmaker(
    socket: Socket,
    ticket: string
): Promise<void> {
    await socket.removeMatchmaker(ticket);
}