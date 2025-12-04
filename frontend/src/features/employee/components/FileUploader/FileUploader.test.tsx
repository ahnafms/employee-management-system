import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import { FileUploader } from "@/features/employee/components/FileUploader/FileUploader";
import * as uploadApi from "@/features/employee/api/upload-employee-csv";
import * as notificationStore from "@/store/notifications";

vi.mock("@/features/employee/api/upload-employee-csv", () => ({
  UploadEmployeeCSV: vi.fn(),
}));

vi.mock("@/store/notifications", () => ({
  useReadUploadProgress: vi.fn(() => null),
  useSetUploadProgress: vi.fn(() => vi.fn()),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

describe("FileUploader", () => {
  const mockUploadEmployeeCSV = uploadApi.UploadEmployeeCSV as ReturnType<
    typeof vi.fn
  >;
  const mockUseReadUploadProgress =
    notificationStore.useReadUploadProgress as ReturnType<typeof vi.fn>;
  const mockUseSetUploadProgress =
    notificationStore.useSetUploadProgress as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUploadEmployeeCSV.mockClear();
    mockUseReadUploadProgress.mockReturnValue(null);
    mockUseSetUploadProgress.mockReturnValue(vi.fn());
  });

  it("should render upload button", () => {
    renderWithProviders(<FileUploader />);

    expect(
      screen.getByRole("button", { name: /Upload CSV/i })
    ).toBeInTheDocument();
  });

  it("should open dialog when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText("Upload Employee CSV")).toBeInTheDocument();
    });
  });

  it("should display dialog title and description", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText("Upload Employee CSV")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Upload a CSV file to import multiple employees at once/
        )
      ).toBeInTheDocument();
    });
  });

  it("should show CSV format example", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText("CSV Format:")).toBeInTheDocument();
      expect(screen.getByText(/name,age,position,salary/)).toBeInTheDocument();
    });
  });

  it("should accept CSV file selection", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Select CSV File/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(
      /Select CSV File/i
    ) as HTMLInputElement;
    const file = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(fileInput.files?.[0]).toBe(file);
      expect(screen.getByText(/Selected: employees.csv/)).toBeInTheDocument();
    });
  });

  it("should reject non-CSV files", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    const fileInput = screen.getByLabelText(
      /Select CSV File/i
    ) as HTMLInputElement;
    const file = new File(["invalid"], "file.txt", { type: "text/plain" });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(
        screen.getByText(/Please select a valid CSV file/i)
      ).toBeInTheDocument();
    });
  });

  it("should disable upload button when no file is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /Upload$/ });
      expect(submitButton).toBeDisabled();
    });
  });

  it("should enable upload button when file is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    const fileInput = screen.getByLabelText(
      /Select CSV File/i
    ) as HTMLInputElement;
    const file = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );

    await user.upload(fileInput, file);

    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /Upload$/ });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("should handle successful upload", async () => {
    const user = userEvent.setup();
    const mockOnSuccess = vi.fn();

    mockUploadEmployeeCSV.mockResolvedValueOnce({
      success: true,
      message: "Upload successful",
      importedCount: 1,
      failedCount: 0,
    });

    renderWithProviders(<FileUploader onSuccess={mockOnSuccess} />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    const fileInput = screen.getByLabelText(
      /Select CSV File/i
    ) as HTMLInputElement;
    const file = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );

    await user.upload(fileInput, file);

    const submitButton = screen.getByRole("button", { name: /Upload$/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUploadEmployeeCSV).toHaveBeenCalled();
    });
  });

  it("should display upload error message", async () => {
    const user = userEvent.setup();

    mockUploadEmployeeCSV.mockRejectedValueOnce(new Error("Upload failed"));

    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    const fileInput = screen.getByLabelText(
      /Select CSV File/i
    ) as HTMLInputElement;
    const file = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );

    await user.upload(fileInput, file);

    const submitButton = screen.getByRole("button", { name: /Upload$/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/)).toBeInTheDocument();
    });
  });

  it("should close dialog button be available", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Close/i })
      ).toBeInTheDocument();
    });
  });

  it("should clear error on successful file selection after error", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    const fileInput = screen.getByLabelText(
      /Select CSV File/i
    ) as HTMLInputElement;

    // Try invalid file
    const invalidFile = new File(["invalid"], "file.txt", {
      type: "text/plain",
    });
    await user.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(
        screen.getByText(/Please select a valid CSV file/i)
      ).toBeInTheDocument();
    });

    // Select valid file
    const validFile = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );
    await user.upload(fileInput, validFile);

    await waitFor(() => {
      expect(
        screen.queryByText(/Please select a valid CSV file/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should handle dialog close", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText("Upload Employee CSV")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: /Close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Upload Employee CSV")).not.toBeInTheDocument();
    });
  });

  it("should display file name when selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    const fileInput = screen.getByLabelText(
      /Select CSV File/i
    ) as HTMLInputElement;
    const file = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "my-employees.csv",
      { type: "text/csv" }
    );

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(
        screen.getByText(/Selected: my-employees.csv/)
      ).toBeInTheDocument();
    });
  });

  it("should accept .csv file extension", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    const fileInput = screen.getByLabelText(
      /Select CSV File/i
    ) as HTMLInputElement;
    expect(fileInput).toHaveAttribute("accept", ".csv,text/csv");
  });

  it("should display loading state during upload", async () => {
    const user = userEvent.setup();

    mockUploadEmployeeCSV.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                message: "Upload successful",
                importedCount: 1,
                failedCount: 0,
              }),
            100
          )
        )
    );

    renderWithProviders(<FileUploader />);

    const uploadButton = screen.getByRole("button", { name: /Upload CSV/i });
    await user.click(uploadButton);

    const fileInput = screen.getByLabelText(
      /Select CSV File/i
    ) as HTMLInputElement;
    const file = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );

    await user.upload(fileInput, file);

    const submitButton = screen.getByRole("button", { name: /Upload$/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Uploading/i })
      ).toBeInTheDocument();
    });
  });
});
