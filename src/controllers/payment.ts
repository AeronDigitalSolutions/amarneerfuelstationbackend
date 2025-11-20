import { Request, Response } from "express";
import Payment, { IPayment } from "../models/payment";

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { amount, mode } = req.body;

    if (!amount || !mode) {
      return res
        .status(400)
        .json({ message: "Amount and Payment Mode are required" });
    }

    const payment: IPayment = await Payment.create({ amount, mode });

    res.status(201).json({ message: "Payment saved", payment });
  } catch (error) {
    res.status(500).json({ message: "Error creating payment", error });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
};
