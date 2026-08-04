"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PropertyWizard, { PropertyData } from "@/components/PropertyWizard";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function NewPropertyPage() {
  const router = useRouter();

  async function handleSubmit(data: PropertyData) {
    try {
      await api.post("/api/properties", {
        title: data.title,
        description: data.description,
        type: data.type,
        transactionType: data.transactionType,
        price: Number(data.price),
        priceNegotiable: data.priceNegotiable,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode || undefined,
        landmark: data.landmark || undefined,
        size: Number(data.size),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        parking: Number(data.parking),
        furnishing: data.furnishing || undefined,
        amenities: data.amenities,
        images: data.images,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        ...(data.yearBuilt ? { yearBuilt: Number(data.yearBuilt) } : {}),
        ...(data.societyName ? { societyName: data.societyName } : {}),
        ...(data.latitude ? { latitude: Number(data.latitude) } : {}),
        ...(data.longitude ? { longitude: Number(data.longitude) } : {}),
        ...(data.nearbyLandmarks.length ? { nearbyLandmarks: data.nearbyLandmarks } : {}),
        ...(data.builtupArea ? { builtupArea: Number(data.builtupArea) } : {}),
        ...(data.carpetArea ? { carpetArea: Number(data.carpetArea) } : {}),
        ...(data.balconies ? { balconies: Number(data.balconies) } : {}),
        ...(data.parkingType ? { parkingType: data.parkingType } : {}),
        ...(data.floors ? { floors: Number(data.floors) } : {}),
        ...(data.floorNumber ? { floorNumber: Number(data.floorNumber) } : {}),
        ...(data.possessionStatus ? { possessionStatus: data.possessionStatus } : {}),
        ...(data.possessionStatus === "under_construction" && data.possessionDate
          ? { possessionDate: data.possessionDate }
          : {}),
        ...(data.ageOfBuilding ? { ageOfBuilding: data.ageOfBuilding } : {}),
        ...(data.ownershipType ? { ownershipType: data.ownershipType } : {}),
        ...(data.maintenanceCharges ? { maintenanceCharges: Number(data.maintenanceCharges) } : {}),
        ...(data.flooringType ? { flooringType: data.flooringType } : {}),
        ...(data.facingDirection ? { facingDirection: data.facingDirection } : {}),
        ...(data.powerBackup ? { powerBackup: data.powerBackup } : {}),
        gatedSecurity: data.gatedSecurity,
        ...(data.brochureUrl ? { brochureUrl: data.brochureUrl } : {}),
        ...(data.amenitiesPdfUrl ? { amenitiesPdfUrl: data.amenitiesPdfUrl } : {}),
        verificationStatus: data.verificationStatus,
        featured: data.featured,
      });
      toast.success("Property submitted — auto-approved as super admin");
      router.push("/dashboard/properties");
    } catch (e) {
      toast.error((e as Error).message);
      throw e;
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/properties"
          className="p-2 rounded-xl text-txt-sub hover:text-txt-title hover:bg-neutral-500/5 transition-all border border-card-border"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-xs text-txt-muted font-bold">Auto-approved submission</span>
      </div>

      <PropertyWizard onSubmit={handleSubmit} submitLabel="Create & Publish" />
    </div>
  );
}
