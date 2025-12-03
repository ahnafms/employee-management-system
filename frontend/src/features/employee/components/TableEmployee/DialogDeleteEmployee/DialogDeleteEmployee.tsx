import { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { Employee } from "@/features/employee/dto/employee";
import { useDialogDeleteEmployee } from "./useDialogDeleteEmployee";

export interface DialogDeleteEmployeeRef {
  openDialog: (employee: Employee) => void;
}

export const DialogDeleteEmployee = forwardRef<DialogDeleteEmployeeRef>(
  function DialogDeleteEmployee(_, ref) {
    const {
      open,
      deletingEmployee,
      isLoading,
      openDialog,
      closeDialog,
      handleSubmit,
    } = useDialogDeleteEmployee();

    const [messageDialog, setMessageDialog] = useState<{
      open: boolean;
      title: string;
      message: string;
    }>({ open: false, title: "", message: "" });

    useImperativeHandle(ref, () => ({
      openDialog,
    }));

    const handleConfirm = async () => {
      const result = await handleSubmit();
      setMessageDialog({
        open: true,
        title: result.success ? "Success" : "Error",
        message: result.message,
      });
    };

    return (
      <>
        <AlertDialog open={open} onOpenChange={closeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the employee{" "}
                <span className="font-semibold">{deletingEmployee?.name}</span>.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Message Dialog */}
        <AlertDialog
          open={messageDialog.open}
          onOpenChange={(open) =>
            setMessageDialog((prev) => ({ ...prev, open }))
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{messageDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {messageDialog.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() =>
                  setMessageDialog((prev) => ({ ...prev, open: false }))
                }
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);
