import { Request, Response } from "express";
import CreditAccount from "../models/creditLineModel";

// ✅ Add Account
export const addCreditAccount = async (req: Request, res: Response) => {
  try {
    const {
      accountId,
      accountName,
      phoneNo,
      email,
      companyName,
      aadhaarNo,
      panNo,
      document,
      fuelType,
      creditLimit,
      contactPerson,
      vehicles,
    } = req.body;

    let parsedVehicles = vehicles;
    if (typeof vehicles === "string") {
      try {
        parsedVehicles = JSON.parse(vehicles);
      } catch {
        parsedVehicles = [];
      }
    }

    const newAccount = await CreditAccount.create({
      accountId,
      accountName,
      phoneNo,
      email,
      companyName,
      aadhaarNo,
      panNo,
      document,
      fuelType,
      creditLimit,
      contactPerson,
      vehicles: parsedVehicles,
      totalSales: 0,
      totalPayments: 0,
      outstanding: 0,
      transactions: [],
    });

    return res.status(201).json(newAccount);
  } catch (error) {
    console.error("Error creating credit account:", error);
    return res.status(500).json({ message: "Error creating credit account", error });
  }
};

// ✅ Get all accounts
export const getAllAccounts = async (_req: Request, res: Response) => {
  try {
    const accounts = await CreditAccount.find().sort({ createdAt: -1 });
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching accounts", error });
  }
};

// ✅ Add Sale / Payment
export const addTransaction = async (req: Request, res: Response) => {
  try {
    const {
      accountId,
      type,
      amount,
      paymentMode,
      vehicleNo,
      fuelType,
      rate,
      volume,
    } = req.body;

    const account = await CreditAccount.findOne({ accountId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const transaction = {
      date: new Date(),
      type,
      amount,
      paymentMode: paymentMode || "",
      vehicleNo,
      fuelType,
      rate,
      volume,
    };

    account.transactions.push(transaction);

    if (type === "Sale") account.totalSales += amount;
    if (type === "Payment") account.totalPayments += amount;

    account.outstanding = account.totalSales - account.totalPayments;

    await account.save();

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: "Error adding transaction", error });
  }
};

// ✅ Get details by ID
export const getAccountDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const account = await CreditAccount.findById(id);

    if (!account) return res.status(404).json({ message: "Account not found" });

    return res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: "Error fetching account details", error });
  }
};

// ✅ Delete account
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await CreditAccount.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Account not found" });

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting account", error });
  }
};
