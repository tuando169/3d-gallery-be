import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/route';
import paymentRouter from "./modules/payment/paymentRoute";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(helmet());
app.use(cors());

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use("/payment", paymentRouter);

app.use('/', routes);

app.listen(PORT, () => {
  console.log('Port is listening on port ' + PORT);
});
