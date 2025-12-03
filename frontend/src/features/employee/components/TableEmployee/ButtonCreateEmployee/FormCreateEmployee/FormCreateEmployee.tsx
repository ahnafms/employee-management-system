import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormCreateEmployee } from "./useFormCreateEmployee";

interface FormCreateEmployeeProps {
  onSuccess?: () => void;
}

export function FormCreateEmployee({ onSuccess }: FormCreateEmployeeProps) {
  const {
    onSubmit,
    register,
    handleSubmit,
    isSubmitting,
    submitMessage,
    errors,
  } = useFormCreateEmployee({ onSuccess });

  return (
    <div className="space-y-5">
      {submitMessage && (
        <div
          className={`mb-4 p-4 rounded-md ${
            submitMessage.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {submitMessage.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="e.g., John Doe"
            {...register("name")}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Age Field */}
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="e.g., 30"
            {...register("age", { valueAsNumber: true })}
            aria-describedby={errors.age ? "age-error" : undefined}
            className={errors.age ? "border-red-500" : ""}
          />
          {errors.age && (
            <p id="age-error" className="text-sm text-red-500">
              {errors.age.message}
            </p>
          )}
        </div>

        {/* Position Field */}
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            placeholder="e.g., Software Engineer"
            {...register("position")}
            aria-describedby={errors.position ? "position-error" : undefined}
            className={errors.position ? "border-red-500" : ""}
          />
          {errors.position && (
            <p id="position-error" className="text-sm text-red-500">
              {errors.position.message}
            </p>
          )}
        </div>

        {/* Salary Field */}
        <div className="space-y-2">
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            type="number"
            step="0.01"
            placeholder="e.g., 75000.00"
            {...register("salary", { valueAsNumber: true })}
            aria-describedby={errors.salary ? "salary-error" : undefined}
            className={errors.salary ? "border-red-500" : ""}
          />
          {errors.salary && (
            <p id="salary-error" className="text-sm text-red-500">
              {errors.salary.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Employee"}
        </Button>
      </form>
    </div>
  );
}
