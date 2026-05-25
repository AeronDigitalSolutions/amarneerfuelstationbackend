import express from "express";
import {
  addCreditAccount,
  getAllAccounts,
  addTransaction,
  getAccountDetails,
  deleteAccount,
  sendCreditEmail,      // existing email route
  sendReminderEmail,    // ⭐ NEW reminder route
} from "../controllers/creditLineController";



import { 
  getAllCreditTransactions,
  getCreditTransactionSummary,
} from "../controllers/creditTransactionController";  // ⭐ NEW
const router = express.Router();

/* -------------------------------
   EXISTING CREDIT LINE ROUTES
--------------------------------*/
router.post("/credit", addCreditAccount);
router.get("/credit", getAllAccounts);

/* ⭐ MUST BE ABOVE ANY :id ROUTE */
router.get("/credit/transaction", getAllCreditTransactions);
router.get("/credit/transaction/summary", getCreditTransactionSummary);

/* This must stay AFTER /credit/transaction */
router.post("/credit/transaction", addTransaction);

/* ⭐ All :id routes MUST be last */
router.get("/credit/:id", getAccountDetails);
router.delete("/credit/:id", deleteAccount);

/* Email Routes */
router.post("/credit/send-email", sendCreditEmail);
router.post("/credit/send-reminder", sendReminderEmail);

export default router;
