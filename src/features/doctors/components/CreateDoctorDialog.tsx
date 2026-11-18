"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Activity,
  Building2,
  Phone,
  Mail,
  Loader2,
  UserPlus,
} from "lucide-react";
import { createDoctorSchema, CreateDoctorInput } from "../schemas";
import { useCreateDoctorMutation } from "../hooks";
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
import { cn } from "@/lib/utils";

const RECOMMENDED_SPECIALTIES = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Oncology",
  "Psychiatry",
  "General Surgery",
  "Gynecology",
  "Endocrinology",
] as const;

export interface CreateDoctorDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateDoctorDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: CreateDoctorDialogProps) {
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

  const createDoctorMutation = useCreateDoctorMutation();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateDoctorInput>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      name: "",
      specialization: "",
      hospital: "",
      phone: "",
      email: "",
    },
  });

  const selectedSpecialization = useWatch({
    control,
    name: "specialization",
  });

  const onSubmit = (values: CreateDoctorInput) => {
    createDoctorMutation.mutate(values, {
      onSuccess: () => {
        reset();
        handleOpenChange(false);
      },
    });
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
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center space-x-2 text-primary mb-1">
              <UserPlus className="h-5 w-5" />
              <DialogTitle>Register New Doctor</DialogTitle>
            </div>
            <DialogDescription>
              Add a licensed healthcare practitioner to the clinic tracker. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
            {/* Doctor Name */}
            <div className="space-y-1 text-left">
              <label
                htmlFor="name"
                className="text-xs font-semibold text-foreground uppercase tracking-wider"
              >
                Doctor Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="pl-9"
                  error={Boolean(errors.name)}
                  disabled={createDoctorMutation.isPending}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-medium text-danger mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Specialization */}
            <div className="space-y-1 text-left">
              <label
                htmlFor="specialization"
                className="text-xs font-semibold text-foreground uppercase tracking-wider"
              >
                Medical Specialization
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="specialization"
                  list="specialty-recommendations"
                  type="text"
                  placeholder="e.g. Cardiology"
                  className="pl-9"
                  error={Boolean(errors.specialization)}
                  disabled={createDoctorMutation.isPending}
                  {...register("specialization")}
                />
                <datalist id="specialty-recommendations">
                  {RECOMMENDED_SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec} />
                  ))}
                </datalist>
              </div>

              {/* Recommendations Chips */}
              <div className="pt-1">
                <p className="text-[11px] font-medium text-muted-foreground mb-1">
                  Recommended Specialties:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                  {RECOMMENDED_SPECIALTIES.map((spec) => {
                    const isSelected = selectedSpecialization === spec;
                    return (
                      <button
                        key={spec}
                        type="button"
                        disabled={createDoctorMutation.isPending}
                        onClick={() =>
                          setValue("specialization", spec, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-md border transition-colors select-none cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-surface-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {errors.specialization && (
                <p className="text-xs font-medium text-danger mt-1">
                  {errors.specialization.message}
                </p>
              )}
            </div>

            {/* Hospital Name */}
            <div className="space-y-1 text-left">
              <label
                htmlFor="hospital"
                className="text-xs font-semibold text-foreground uppercase tracking-wider"
              >
                Hospital / Clinical Center
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="hospital"
                  type="text"
                  placeholder="e.g. Metropolitan General Hospital"
                  className="pl-9"
                  error={Boolean(errors.hospital)}
                  disabled={createDoctorMutation.isPending}
                  {...register("hospital")}
                />
              </div>
              {errors.hospital && (
                <p className="text-xs font-medium text-danger mt-1">
                  {errors.hospital.message}
                </p>
              )}
            </div>

            {/* Contact Information (Phone and Email) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone */}
              <div className="space-y-1 text-left">
                <label
                  htmlFor="phone"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +1 555-019-2834"
                    className="pl-9"
                    error={Boolean(errors.phone)}
                    disabled={createDoctorMutation.isPending}
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs font-medium text-danger mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1 text-left">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    className="pl-9"
                    error={Boolean(errors.email)}
                    disabled={createDoctorMutation.isPending}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-danger mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={createDoctorMutation.isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={createDoctorMutation.isPending}
                className="min-w-[130px]"
              >
                {createDoctorMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Doctor
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
