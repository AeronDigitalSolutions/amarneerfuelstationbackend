import { Request, Response } from "express";
import CreditAccount from "../models/creditLineModel";
import nodemailer from "nodemailer";

/* ------------------------------------------------------
   ⭐ UTILITY FUNCTION — Update status using dynamic dueDays
------------------------------------------------------- */
const updateAccountStatus = (account: any, dueDays?: number) => {
  const outstanding = Number(account.outstanding ?? 0);
  const creditLimit = Number(account.creditLimit ?? 0);

  // If within limit → reset status
  if (outstanding <= creditLimit) {
    account.status = "normal";
    account.dueDate = null;
    return account;
  }

  // ⭐ Over limit → create dynamic due date
  const days = Number(dueDays) || 15; // fallback to 15 if missing

  if (!account.dueDate) {
    // Only set due date first time outstanding exceeds limit
    account.dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  // Status calculation
  const now = new Date();
  const diffDays =
    (new Date(account.dueDate).getTime() - now.getTime()) /
    (1000 * 60 * 60 * 24);

  if (diffDays <= 0) account.status = "overdue";
  else if (diffDays <= 5) account.status = "dueSoon";
  else account.status = "overLimit";

  return account;
};

/* ------------------------------------------------------
   EXISTING CONTROLLERS (UPDATED AS NEEDED)
------------------------------------------------------- */

// ✅ Add Credit Account
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
      dueDate: null,
      status: "normal",
      lastReminderSent: null,
    });

    return res.status(201).json(newAccount);
  } catch (error) {
    console.error("Error creating credit account:", error);
    return res
      .status(500)
      .json({ message: "Error creating credit account", error });
  }
};

// ✅ Get All Accounts
export const getAllAccounts = async (_req: Request, res: Response) => {
  try {
    const accounts = await CreditAccount.find().sort({ createdAt: -1 });
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching accounts", error });
  }
};

// ✅ Add Sale OR Payment
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
      dueDays, // ⭐ NEW: dynamic due days from frontend
    } = req.body;

    const account = await CreditAccount.findOne({ accountId });
    if (!account)
      return res.status(404).json({ message: "Account not found" });

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

    // ⭐ FIXED: Apply dynamic due days here
    updateAccountStatus(account, dueDays);

    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error("Transaction Error:", error);
    res.status(500).json({ message: "Error adding transaction", error });
  }
};

// ✅ Get Specific Account Details
export const getAccountDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const account = await CreditAccount.findById(id);

    if (!account)
      return res.status(404).json({ message: "Account not found" });

    return res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: "Error fetching account details", error });
  }
};

// ✅ Delete Account
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await CreditAccount.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ message: "Account not found" });

    return res
      .status(200)
      .json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting account", error });
  }
};

/* ------------------------------------------------------
   ⭐ SEND INVOICE EMAIL WITH ATTACHED PDF
------------------------------------------------------- */
export const sendCreditEmail = async (req: Request, res: Response) => {
  try {
    const { email, pdfBase64, accountId } = req.body;

    if (!email || !pdfBase64)
      return res
        .status(400)
        .json({ message: "Missing email or PDF data" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Fuel Station" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Invoice for Account ${accountId}`,
      text: "Please find your invoice attached.",
      attachments: [
        {
          filename: `invoice-${accountId}.pdf`,
          content: pdfBase64.split("base64,")[1],
          encoding: "base64",
        },
      ],
    });

    res
      .status(200)
      .json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Email sending failed", error });
  }
};

/* ------------------------------------------------------
   ⭐ SEND REMINDER EMAIL (Due Soon / Overdue)
------------------------------------------------------- */
export const sendReminderEmail = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.body;

    const acc = await CreditAccount.findOne({ accountId });
    if (!acc) return res.status(404).json({ message: "Account not found" });

    if (!acc.email)
      return res.status(400).json({ message: "No email registered" });

    if (acc.status === "normal")
      return res
        .status(400)
        .json({ message: "Outstanding is within limit" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const textMsg =
      acc.status === "overdue"
        ? `Your payment is OVERDUE. Please clear it immediately.`
        : `Reminder: Your payment due date is approaching. Please clear soon.`;

    await transporter.sendMail({
      from: `"Fuel Station" <${process.env.SMTP_EMAIL}>`,
      to: acc.email,
      subject: `Payment Reminder — Account ${acc.accountId}`,
      text: textMsg,
    });

    acc.lastReminderSent = new Date();
    await acc.save();

    res.status(200).json({ success: true, message: "Reminder sent!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Reminder send failed", error: e });
  }
};
