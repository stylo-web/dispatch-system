import express from 'express';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoute from './src/routes/user.routes.js';
import helmet from 'helmet';
import cookieParser from "cookie-parser";
import path from 'path';


dotenv.config();
const app = express();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(cors({
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

connectDB();


app.use('/api', userRoute);




app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || PORT}`);
});

