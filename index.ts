import app from "./src/app";
import { PORT, NODE_ENV } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";
import colors from "colors";

connectToMongoDB();

app.listen(PORT, () => {
    console.log(
        colors.green.bold.underline(
            `Aegis API running in ${NODE_ENV} mode on port ${PORT}`
        )
    );
});
