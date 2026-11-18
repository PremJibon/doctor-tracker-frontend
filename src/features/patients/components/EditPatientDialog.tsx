"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Patient } from "@/types/patient";
import { updatePatientSchema, UpdatePatientFormData } from "../schemas";
import { useUpdatePatientMutation } from "../hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface EditPatientDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"] as const;

function formatDateForInput(dateStr: string | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export function EditPatientDialog({
  patient,
  open,
  onOpenChange,
}: EditPatientDialogProps) {
  const { mutate, isPending } = useUpdatePatientMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePatientFormData>({
    resolver: zodResolver(updatePatientSchema),
  });

  useEffect(() => {
    if (patient && open) {
      reset({
        name: patient.name,
        age: patient.age,
        gender: patient.gender as UpdatePatientFormData["gender"],
        phone: patient.phone,
        condition: patient.condition,
        admittedAt: formatDateForInput(patient.admittedAt),
      });
    }
  }, [patient, open, reset]);

  const onSubmit = (data: UpdatePatientFormData) => {
    if (!patient) return;
    const payload = { ...data };
    if (payload.admittedAt === "") delete payload.admittedAt;
    mutate(
      { id: patient._id || patient.id || "", data: payload },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Edit Patient
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update patient details. All changes are saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-3">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="edit-name">
              Full Name
            </label>
            <Input
              id="edit-name"
              placeholder="e.g. Jane Smith"
              className="text-base"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          {/* Age + Gender row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="edit-age">
                Age
              </label>
              <Input
                id="edit-age"
                type="number"
                min={0}
                max={130}
                placeholder="e.g. 34"
                className="text-base"
                {...register("age", { valueAsNumber: true })}
              />
              {errors.age && (
                <p className="text-xs text-danger">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="edit-gender">
                Gender
              </label>
              <select
                id="edit-gender"
                className="
                  flex h-10 w-full rounded-md border border-border
                  bg-surface px-3 py-2 text-base text-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary/40
                  disabled:cursor-not-allowed disabled:opacity-50
                "
                {...register("gender")}
              >
                <option value="">Select…</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p className="text-xs text-danger">{errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="edit-phone">
              Phone
            </label>
            <Input
              id="edit-phone"
              type="tel"
              placeholder="e.g. +1-555-0100"
              className="text-base"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-danger">{errors.phone.message}</p>
            )}
          </div>

          {/* Condition */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="edit-condition">
              Medical Condition
            </label>
            <Input
              id="edit-condition"
              placeholder="e.g. Hypertension"
              className="text-base"
              {...register("condition")}
            />
            {errors.condition && (
              <p className="text-xs text-danger">{errors.condition.message}</p>
            )}
          </div>

          {/* Admitted At */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="edit-admittedAt">
              Admission Date{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              id="edit-admittedAt"
              type="date"
              className="text-base"
              {...register("admittedAt")}
            />
            {errors.admittedAt && (
              <p className="text-xs text-danger">{errors.admittedAt.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
