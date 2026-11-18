"use client";

import React from "react";
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
import { useBulkDeletePatientsMutation } from "../hooks";

export interface PatientBulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export function PatientBulkDeleteDialog({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: PatientBulkDeleteDialogProps) {
  const { mutateAsync: doBulkDelete, isPending } = useBulkDeletePatientsMutation();

  const handleConfirm = async () => {
    try {
      await doBulkDelete(selectedIds);
      onOpenChange(false);
      onSuccess();
    } catch {
      // Handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-left text-lg font-semibold text-foreground">
              Delete {selectedIds.length} Patient Record{selectedIds.length === 1 ? "" : "s"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-left text-sm text-muted-foreground pt-1">
            Are you sure you want to permanently delete {selectedIds.length} selected patient
            record{selectedIds.length === 1 ? "" : "s"}? This action cannot be undone.
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
            onClick={handleConfirm}
            className="rounded-xl min-h-[40px] shadow-raised"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              `Delete ${selectedIds.length} Patient${selectedIds.length === 1 ? "" : "s"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
