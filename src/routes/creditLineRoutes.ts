import express from "express";
import {
  addCreditAccount,
  getAllAccounts,
  addTransaction,
  getAccountDetails,
  deleteAccount,
} from "../controllers/creditLineController";

const router = express.Router();

router.post("/credit", addCreditAccount);
router.get("/credit", getAllAccounts);
router.get("/credit/:id", getAccountDetails);
router.post("/credit/transaction", addTransaction);
router.delete("/credit/:id", deleteAccount);

export default router;
