"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, User, Calendar, Phone, Activity, Loader2 } from "lucide-react";
import { addDoctorPatientSchema, AddDoctorPatientInput } from "../schemas";
import { useAddDoctorPatientMutation } from "../hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface AddDoctorPatientDialogProps {
  doctorId: string;
  doctorName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AddDoctorPatientDialog({
  doctorId,
  doctorName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: AddDoctorPatientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    controlledOnOpenChange?.(nextOpen);
    if (!nextOpen) {
      reset();
    }
  };

  const addPatientMutation = useAddDoctorPatientMutation(doctorId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddDoctorPatientInput>({
    resolver: zodResolver(addDoctorPatientSchema),
    defaultValues: {
      name: "",
      age: 30,
      gender: "Male",
      phone: "",
      condition: "",
      admittedAt: "",
    },
  });

  const onSubmit = (values: AddDoctorPatientInput) => {
    addPatientMutation.mutate(
      {
        ...values,
        admittedAt: values.admittedAt || new Date().toISOString(),
      },
      {
        onSuccess: () => {
          reset();
          handleOpenChange(false);
        },
      }
    );
  };

  return (
    <>
      {trigger && (
        <span
          onClick={() => handleOpenChange(true)}
          className="inline-block cursor-pointer"
        >
          {trigger}
        </span>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2 text-primary mb-1">
              <UserPlus className="h-5 w-5" />
              <DialogTitle>Add Patient to Doctor</DialogTitle>
            </div>
            <DialogDescription>
              Assign a new patient to {doctorName || "this doctor"}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Patient Name */}
            <div className="space-y-1 text-left">
              <label htmlFor="patient-name" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Patient Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="patient-name"
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  className="pl-9"
                  error={Boolean(errors.name)}
                  disabled={addPatientMutation.isPending}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-medium text-danger">{errors.name.message}</p>
              )}
            </div>

            {/* Age & Gender Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-left">
                <label htmlFor="patient-age" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Age
                </label>
                <Input
                  id="patient-age"
                  type="number"
                  placeholder="e.g. 45"
                  error={Boolean(errors.age)}
                  disabled={addPatientMutation.isPending}
                  {...register("age", { valueAsNumber: true })}
                />
                {errors.age && (
                  <p className="text-xs font-medium text-danger">{errors.age.message}</p>
                )}
              </div>

              <div className="space-y-1 text-left">
                <label htmlFor="patient-gender" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Gender
                </label>
                <select
                  id="patient-gender"
                  className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-base md:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 min-h-[40px]"
                  disabled={addPatientMutation.isPending}
                  {...register("gender")}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="text-xs font-medium text-danger">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1 text-left">
              <label htmlFor="patient-phone" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="patient-phone"
                  type="tel"
                  placeholder="e.g. +1 555-012-3456"
                  className="pl-9"
                  error={Boolean(errors.phone)}
                  disabled={addPatientMutation.isPending}
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p className="text-xs font-medium text-danger">{errors.phone.message}</p>
              )}
            </div>

            {/* Condition / Diagnosis */}
            <div className="space-y-1 text-left">
              <label htmlFor="patient-condition" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Medical Condition / Diagnosis
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="patient-condition"
                  type="text"
                  placeholder="e.g. Hypertension, Type 2 Diabetes"
                  className="pl-9"
                  error={Boolean(errors.condition)}
                  disabled={addPatientMutation.isPending}
                  {...register("condition")}
                />
              </div>
              {errors.condition && (
                <p className="text-xs font-medium text-danger">{errors.condition.message}</p>
              )}
            </div>

            {/* Admitted Date */}
            <div className="space-y-1 text-left">
              <label htmlFor="patient-admitted" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Admission Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="patient-admitted"
                  type="date"
                  className="pl-9"
                  disabled={addPatientMutation.isPending}
                  {...register("admittedAt")}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={addPatientMutation.isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={addPatientMutation.isPending}
                className="min-w-[120px]"
              >
                {addPatientMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Patient"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
