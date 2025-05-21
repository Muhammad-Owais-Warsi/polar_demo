import express from "express"
import cors from "cors"
import * as dotenv from "dotenv"
import { BetterPay } from "better-pay"
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const provider = new BetterPay({
  provider: 'polar',
  accessToken: process.env.ACCESS_TOKEN
});

app.post("/create", async (req,res) => {
  const data = req.body;
  const response = await provider.createPayment({
    name: data.name,
    amount: data.amount,
    currency: data.currency
  })
  
  res.json({
    message: response
  })
})

app.post("/confirm", async (req, res) => {
  const data = req.body;
  const productId = data.productId.map((id) => {
    return id;
  })
  
  const response = await provider.confirmPayment({
    productId: productId,
    returnUrl: data.returnUrl
  });

  return res.json({ message: response });
});

app.listen(4000, () => {
  console.log("running")
})