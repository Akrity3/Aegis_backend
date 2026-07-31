import http from "http";
import app from "./src/app";
import { PORT, NODE_ENV } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";
import { socketService } from "./src/socket/socket.service";
import colors from "colors";

connectToMongoDB();

const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

server.listen(PORT, () => {
    console.log(
        colors.green.bold.underline(
            `Aegis API with Socket.IO running in ${NODE_ENV} mode on port ${PORT}`
        )
    );
});

