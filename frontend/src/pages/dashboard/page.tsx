import { FileUploader } from "@/features/employee/components";
import { ButtonCreateEmployee } from "@/features/employee/components/TableEmployee/ButtonCreateEmployee/ButtonCreateEmployee";
import { TableEmployee } from "@/features/employee/components/TableEmployee";

export const DashboardPage = () => {
  return (
    <div className="flex flex-col">
      <div className="flex gap-4">
        <ButtonCreateEmployee />
        <FileUploader />
      </div>
      <TableEmployee />
    </div>
  );
};
