"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PropertyWizard, { PropertyData, emptyData } from "@/components/PropertyWizard";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Record<string, unknown>>(`/api/properties/${id}`)
      .then((p) => {
        setInitial({
          ...emptyData(),
          title: String(p.title ?? ""),
          description: String(p.description ?? ""),
          type: String(p.type ?? "apartment"),
          transactionType: String(p.transactionType ?? "sale"),
          societyName: String(p.societyName ?? ""),
          address: String(p.address ?? ""),
          city: String(p.city ?? ""),
          state: String(p.state ?? ""),
          pincode: String(p.pincode ?? ""),
          landmark: String(p.landmark ?? ""),
          latitude: p.latitude !== undefined && p.latitude !== null ? String(p.latitude) : "",
          longitude: p.longitude !== undefined && p.longitude !== null ? String(p.longitude) : "",
          nearbyLandmarks: Array.isArray(p.nearbyLandmarks)
            ? (p.nearbyLandmarks as { name: string; category: string; distance?: string }[]).map((l) => ({
                name: l.name ?? "",
                category: l.category ?? "transit",
                distance: l.distance ?? "",
              }))
            : [],
          price: String(p.price ?? ""),
          priceNegotiable: Boolean(p.priceNegotiable),
          size: String(p.size ?? ""),
          builtupArea: p.builtupArea ? String(p.builtupArea) : "",
          carpetArea: p.carpetArea ? String(p.carpetArea) : "",
          bedrooms: String(p.bedrooms ?? 0),
          bathrooms: String(p.bathrooms ?? 0),
          balconies: String(p.balconies ?? 0),
          parking: String(p.parking ?? 0),
          parkingType: String(p.parkingType ?? ""),
          floors: p.floors ? String(p.floors) : "",
          floorNumber: p.floorNumber !== undefined && p.floorNumber !== null ? String(p.floorNumber) : "",
          furnishing: String(p.furnishing ?? ""),
          amenities: Array.isArray(p.amenities) ? (p.amenities as string[]) : [],
          images: Array.isArray(p.images) ? (p.images as string[]) : [],
          contactName: String(p.contactName ?? ""),
          contactPhone: String(p.contactPhone ?? ""),
          contactEmail: String(p.contactEmail ?? ""),
          yearBuilt: p.yearBuilt ? String(p.yearBuilt) : "",
          possessionStatus: String(p.possessionStatus ?? ""),
          possessionDate: p.possessionDate ? String(p.possessionDate).slice(0, 10) : "",
          ageOfBuilding: String(p.ageOfBuilding ?? ""),
          ownershipType: String(p.ownershipType ?? ""),
          maintenanceCharges: p.maintenanceCharges ? String(p.maintenanceCharges) : "",
          flooringType: String(p.flooringType ?? ""),
          facingDirection: String(p.facingDirection ?? ""),
          powerBackup: String(p.powerBackup ?? ""),
          gatedSecurity: Boolean(p.gatedSecurity),
          brochureUrl: String(p.brochureUrl ?? ""),
          amenitiesPdfUrl: String(p.amenitiesPdfUrl ?? ""),
          verificationStatus: String(p.verificationStatus ?? "unverified"),
          featured: Boolean(p.featured),
        });
      })
      .catch(() => toast.error("Failed to load property"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: PropertyData) {
    try {
      await api.put(`/api/properties/${id}`, {
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
        nearbyLandmarks: data.nearbyLandmarks,
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
      toast.success("Property updated");
      router.push("/dashboard/properties");
    } catch (e) {
      toast.error((e as Error).message);
      throw e;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="w-7 h-7 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!initial) return <p className="text-txt-muted text-sm">Property not found.</p>;

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
        <span className="text-xs text-txt-muted font-bold truncate max-w-xs md:max-w-md">Editing: {initial.title}</span>
      </div>

      <PropertyWizard initial={initial} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}
