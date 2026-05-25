import { Request, Response } from "express";
import Payment from "../models/payment";
import { getPumpIdOrThrow } from "../middleware/pumpContext";

export const createPayment = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { amount, mode } = req.body;

    if (!amount || !mode) {
      return res.status(400).json({ message: "Amount and Payment Mode are required" });
    }

    const payment = await Payment.create({ amount, mode, pumpId });

    res.status(201).json({ message: "Payment saved", payment });
  } catch (error) {
    res.status(500).json({ message: "Error creating payment", error });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const payments = await Payment.findAll({ where: { pumpId }, order: [["createdAt", "DESC"]] });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
};
