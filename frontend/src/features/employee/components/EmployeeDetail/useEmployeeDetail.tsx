import { useParams } from "@tanstack/react-router";
import { useGetEmployeeDetail } from "../../api/get-employee";
import { useQueryClient } from "@tanstack/react-query";

export const useEmployeeDetail = () => {
  const { employeeId } = useParams({ from: "/home/employee/$employeeId" });
  const { data, isLoading } = useGetEmployeeDetail(employeeId);
  const queryClient = useQueryClient();

  const invalidateQuery = () => {
    queryClient.invalidateQueries({
      queryKey: ["employee", employeeId],
      exact: false,
    });
  };

  return {
    employeeId,
    data,
    isLoading,
    queryClient,
    invalidateQuery,
  };
};
