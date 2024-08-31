import { Request } from "express";
import { Server, Socket } from "socket.io";

interface ISocketEventParams {
    req: Request;
    roomId: string;
    event: string;
    payload: any;
}

// unread count event
const unreadCountEvent = (socket: Socket) => {
    socket.on("unread-count", async (userId) => {
        // get the unread count from the database
        socket.emit("unread-count", { count: 5 });
    });
}

// read all notifications event
const readAllEvent = (socket: Socket) => {
    socket.on("read-all", async (userId) => {
        // mark all notifications as read in the database
    });
}

export const initializeSocketIO = (io: Server) => {
    return io.on("connection", async (socket: Socket) => {
        try {
            const user = socket.handshake.headers.user as string;
            console.log('socket connected >>>>', user);

            // join the room with user id
            socket.join(user);

            // Common events that needs to be mounted on the initialization
            unreadCountEvent(socket);
            readAllEvent(socket);

            socket.on("disconnect", async () => {
                console.log("user has disconnected..", user);
            });

        } catch (error: any) {
            socket.emit("socket-error", error?.message || "Something went wrong while connecting to the socket.");
        }
    });
};

export const emitSocketEvent = ({ req, roomId, event, payload }: ISocketEventParams) => {
    req.app.get("io").in(roomId).emit(event, payload);
};
