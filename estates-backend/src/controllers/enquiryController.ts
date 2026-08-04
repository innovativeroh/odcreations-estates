import { Request, Response } from "express";
import { Enquiry } from "../models/Enquiry";
import { AuthRequest } from "../middleware/auth";

export async function listEnquiries(_req: AuthRequest, res: Response): Promise<void> {
  const enquiries = await Enquiry.find()
    .populate("property", "title city images")
    .sort({ createdAt: -1 });
  res.json(enquiries);
}

export async function getPropertyEnquiries(req: Request, res: Response): Promise<void> {
  const enquiries = await Enquiry.find({ property: req.params.propertyId }).sort({ createdAt: -1 });
  res.json(enquiries);
}

export async function updateEnquiryStatus(req: AuthRequest, res: Response): Promise<void> {
  const { status } = req.body as { status: string };
  if (!["new", "contacted", "closed"].includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!enquiry) { res.status(404).json({ error: "Not found" }); return; }
  res.json(enquiry);
}

export async function deleteEnquiry(req: AuthRequest, res: Response): Promise<void> {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ message: "Enquiry deleted" });
}
