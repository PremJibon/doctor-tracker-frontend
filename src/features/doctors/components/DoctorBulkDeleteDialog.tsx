"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
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
import { useBulkDeleteDoctorsMutation } from "../hooks";
import { DoctorSkippedEntry } from "../api";
import { toast } from "sonner";

export interface DoctorBulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export function DoctorBulkDeleteDialog({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: DoctorBulkDeleteDialogProps) {
  const [stage, setStage] = useState<"initial" | "cascade">("initial");
  const [skippedDoctors, setSkippedDoctors] = useState<DoctorSkippedEntry[]>([]);
  const [confirmInput, setConfirmInput] = useState("");

  const { mutateAsync: doBulkDelete, isPending } = useBulkDeleteDoctorsMutation();

  const totalPatients = skippedDoctors.reduce((sum, d) => sum + (d.patientCount || 0), 0);

  const resetState = () => {
    setStage("initial");
    setSkippedDoctors([]);
    setConfirmInput("");
  };

  const handleInitialDelete = async () => {
    try {
      const res = await doBulkDelete({ ids: selectedIds, cascade: false });

      if (res.skipped && res.skipped.length > 0) {
        // Enters Stage 2: Some doctors have patients
        setSkippedDoctors(res.skipped);
        setStage("cascade");
      } else {
        toast.success("Doctors deleted", {
          description: `Successfully deleted ${res.deleted} doctor(s).`,
        });
        onOpenChange(false);
        resetState();
        onSuccess();
      }
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleCascadeDelete = async () => {
    if (confirmInput.trim() !== "DELETE") return;

    try {
      const res = await doBulkDelete({ ids: selectedIds, cascade: true });
      toast.success("Doctors and patients deleted", {
        description: `Successfully deleted ${res.deleted} doctor(s) and ${res.deletedPatients} patient(s).`,
      });
      onOpenChange(false);
      resetState();
      onSuccess();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetState();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-md">
        {stage === "initial" ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <DialogTitle className="text-left text-lg font-semibold text-foreground">
                  Delete {selectedIds.length} Doctor{selectedIds.length === 1 ? "" : "s"}
                </DialogTitle>
              </div>
              <DialogDescription className="text-left text-sm text-muted-foreground pt-1">
                Are you sure you want to delete {selectedIds.length} selected practitioner
                record{selectedIds.length === 1 ? "" : "s"}? If any doctor has assigned patients,
                you will be prompted before those patient records are affected.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                className="rounded-xl min-h-[40px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={handleInitialDelete}
                className="rounded-xl min-h-[40px] shadow-raised"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  `Delete ${selectedIds.length} Doctor${selectedIds.length === 1 ? "" : "s"}`
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger animate-pulse">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <DialogTitle className="text-left text-lg font-semibold text-danger">
                  Cascade Patient Deletion Required
                </DialogTitle>
              </div>
              <DialogDescription className="text-left text-sm text-foreground pt-1">
                <strong>{skippedDoctors.length}</strong> doctor{skippedDoctors.length === 1 ? "" : "s"}{" "}
                have <strong>{totalPatients}</strong> patient{totalPatients === 1 ? "" : "s"} in
                total. Deleting them will also permanently delete those patients.
              </DialogDescription>
            </DialogHeader>

            {/* Skipped doctor list */}
            <div className="my-3 max-h-36 overflow-y-auto rounded-xl border border-border/80 bg-surface-muted/50 p-3 space-y-2 text-xs">
              {skippedDoctors.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{doc.name}</span>
                  <span className="text-danger font-medium">
                    {doc.patientCount} patient{doc.patientCount === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 py-2">
              <label
                htmlFor="cascade-confirm-input"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Type <span className="text-danger font-bold">DELETE</span> to confirm permanent cascade:
              </label>
              <Input
                id="cascade-confirm-input"
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Type DELETE"
                className="h-10 text-sm font-mono border-danger/60 focus:ring-danger rounded-xl"
                autoFocus
              />
            </div>

            <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                className="rounded-xl min-h-[40px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={confirmInput.trim() !== "DELETE" || isPending}
                onClick={handleCascadeDelete}
                className="rounded-xl min-h-[40px] shadow-raised"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cascading Deletes...
                  </>
                ) : (
                  "Permanently Delete All"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
