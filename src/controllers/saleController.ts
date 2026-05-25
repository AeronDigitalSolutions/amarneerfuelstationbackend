import { Request, Response } from "express";
import Sale from "../models/saleModel";
import { getPumpIdOrThrow } from "../middleware/pumpContext";

const computeEntry = (entry: any) => {
  const opening = Number(entry.openingMeter || 0);
  const closing = Number(entry.closingMeter || 0);
  const testFuel = Number(entry.testFuel || 0);
  const rate = Number(entry.ratePerLitre || 0);

  let litres = closing - opening - testFuel;
  if (litres < 0) litres = 0;
  const amount = litres * rate;

  return { litres, amount };
};

export const addSale = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const body = req.body;

    if (!Array.isArray(body.entries) || body.entries.length === 0) {
      return res.status(400).json({ message: "At least one nozzle entry is required" });
    }

    let totalLitres = 0;
    let totalAmount = 0;

    const entries = body.entries.map((e: any) => {
      const computed = computeEntry(e);
      totalLitres += computed.litres;
      totalAmount += computed.amount;

      return {
        nozzleNo: e.nozzleNo,
        nozzleName: e.nozzleName || "",
        fuelType: e.fuelType,
        openingMeter: Number(e.openingMeter || 0),
        closingMeter: Number(e.closingMeter || 0),
        testFuel: Number(e.testFuel || 0),
        litres: computed.litres,
        ratePerLitre: Number(e.ratePerLitre || 0),
        amount: Number(computed.amount.toFixed(2)),
        attendant: e.attendant || "",
      };
    });

    const sale = await Sale.create({
      pumpId,
      saleId: body.saleId,
      date: body.date,
      time: body.time,
      shift: body.shift,
      machineNo: body.machineNo,
      entries,
      totalLitres: Number(totalLitres.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      cashAmount: Number(body.cashAmount || 0),
      upiAmount: Number(body.upiAmount || 0),
      cardAmount: Number(body.cardAmount || 0),
      creditLineAmount: Number(body.creditLineAmount || 0),
      companyAccountAmount: Number(body.companyAccountAmount || 0),
      totalReceivedAtPump: Number(body.totalReceivedAtPump || 0),
      totalPayment: Number(body.totalPayment || 0),
      paymentMode: body.paymentMode || "Cash",
      creditParty: body.creditParty || "",
      remarks: body.remarks || "",
      attendant: body.attendant || "",
    });

    res.status(201).json(sale);
  } catch (error: any) {
    console.error("Error saving sale:", error);
    res.status(500).json({ message: "Error saving sale", error: error.message });
  }
};

export const getAllSales = async (_req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(_req);
    const sales = await Sale.findAll({ where: { pumpId }, order: [["createdAt", "DESC"]] });
    res.json(sales);
  } catch (error: any) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ message: "Error fetching sales", error: error.message });
  }
};

export const updateSale = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { id } = req.params;
    const body = req.body;

    if (!Array.isArray(body.entries) || body.entries.length === 0) {
      return res.status(400).json({ message: "At least one nozzle entry is required" });
    }

    let totalLitres = 0;
    let totalAmount = 0;

    const entries = body.entries.map((e: any) => {
      const computed = computeEntry(e);
      totalLitres += computed.litres;
      totalAmount += computed.amount;

      return {
        nozzleNo: e.nozzleNo,
        nozzleName: e.nozzleName || "",
        fuelType: e.fuelType,
        openingMeter: Number(e.openingMeter || 0),
        closingMeter: Number(e.closingMeter || 0),
        testFuel: Number(e.testFuel || 0),
        litres: computed.litres,
        ratePerLitre: Number(e.ratePerLitre || 0),
        amount: Number(computed.amount.toFixed(2)),
        attendant: e.attendant || "",
      };
    });

    const sale = await Sale.findOne({ where: { _id: id, pumpId } });
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    await sale.update({
      ...body,
      entries,
      totalLitres: Number(totalLitres.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      creditLineAmount: Number(body.creditLineAmount || 0),
      companyAccountAmount: Number(body.companyAccountAmount || 0),
      totalReceivedAtPump: Number(body.totalReceivedAtPump || 0),
    });

    res.json(sale);
  } catch (error: any) {
    console.error("Error updating sale:", error);
    res.status(500).json({ message: "Error updating sale", error: error.message });
  }
};

export const deleteSale = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { id } = req.params;
    const sale = await Sale.findOne({ where: { _id: id, pumpId } });
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    await sale.destroy();
    res.json({ message: "Sale deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ message: "Error deleting sale", error: error.message });
  }
};
