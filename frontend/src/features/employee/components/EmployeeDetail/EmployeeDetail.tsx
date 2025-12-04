import { Loader2Icon } from "lucide-react";
import { useEmployeeDetail } from "./useEmployeeDetail";
import {
  DialogEditEmployee,
  type DialogEditEmployeeRef,
} from "../TableEmployee";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export const EmployeeDetail = () => {
  const { data, isLoading, invalidateQuery } = useEmployeeDetail();
  const editDialogRef = useRef<DialogEditEmployeeRef>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2Icon className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="text-center text-gray-500 py-4">
        No employee data available.
      </div>
    );
  }

  const { id, name, age, salary, position } = data.data;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <DialogEditEmployee ref={editDialogRef} onSuccess={invalidateQuery} />
      <h2 className="text-xl font-semibold mb-4">Employee Details</h2>
      <ul className="space-y-2">
        <li>
          <span className="font-medium">ID:</span> {id}
        </li>
        <li>
          <span className="font-medium">Name:</span> {name}
        </li>
        <li>
          <span className="font-medium">Age:</span> {age}
        </li>
        <li>
          <span className="font-medium">Salary:</span> ${salary}
        </li>
        <li>
          <span className="font-medium">Positions:</span> {position}
        </li>
      </ul>

      <div className="mt-10">
        <Button onClick={() => editDialogRef.current?.openDialog(data.data)}>
          Edit Employee
        </Button>
      </div>
    </div>
  );
};
