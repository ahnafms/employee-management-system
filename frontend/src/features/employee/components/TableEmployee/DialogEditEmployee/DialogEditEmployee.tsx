import { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Employee } from "@/features/employee/dto/employee";
import { useDialogEditEmployee } from "./useDialogEditEmployee";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface DialogEditEmployeeRef {
  openDialog: (employee: Employee) => void;
}

export const DialogEditEmployee = forwardRef<DialogEditEmployeeRef>(
  function DialogEditEmployee(_, ref) {
    const {
      open,
      editForm,
      isLoading,
      openDialog,
      closeDialog,
      updateForm,
      handleSubmit,
    } = useDialogEditEmployee();

    const [messageDialog, setMessageDialog] = useState<{
      open: boolean;
      title: string;
      message: string;
    }>({ open: false, title: "", message: "" });

    useImperativeHandle(ref, () => ({
      openDialog,
    }));

    const handleFormSubmit = async () => {
      const result = await handleSubmit();
      setMessageDialog({
        open: true,
        title: result.success ? "Success" : "Error",
        message: result.message,
      });
    };

    return (
      <>
        <Dialog open={open} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update employee information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editForm.age}
                  onChange={(e) => updateForm({ age: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  id="edit-position"
                  value={editForm.position}
                  onChange={(e) => updateForm({ position: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-salary">Salary</Label>
                <Input
                  id="edit-salary"
                  type="number"
                  value={editForm.salary}
                  onChange={(e) => updateForm({ salary: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeDialog}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleFormSubmit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
