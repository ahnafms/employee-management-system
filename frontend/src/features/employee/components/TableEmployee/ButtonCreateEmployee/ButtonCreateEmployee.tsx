import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormCreateEmployee from "./FormCreateEmployee";

export function ButtonCreateEmployee() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit">Create Employee</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Employee</DialogTitle>
          <DialogDescription>
            Fill in the form below to add a new employee to the system.
          </DialogDescription>
        </DialogHeader>
        <FormCreateEmployee onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
