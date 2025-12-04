import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFileUploader } from "@/features/employee/components/FileUploader/useFileUploader";
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

describe("useFileUploader", () => {
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

  it("should open dialog on setOpen call", () => {
    const { result } = renderHook(() => useFileUploader({}));

    result.current.setOpen(true);

    expect(result.current.open).toBe(true);
  });

  it("should close dialog on setOpen call", () => {
    const { result } = renderHook(() => useFileUploader({}));

    result.current.setOpen(true);
    result.current.setOpen(false);

    expect(result.current.open).toBe(false);
  });

  it("should handle file change", () => {
    const { result } = renderHook(() => useFileUploader({}));

    const file = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );

    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(event);
    });

    expect(result.current.file).toBe(file);
    expect(result.current.error).toBeNull();
  });

  it("should reject invalid file types", () => {
    const { result } = renderHook(() => useFileUploader({}));

    const file = new File(["invalid"], "file.txt", { type: "text/plain" });

    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(event);
    });

    expect(result.current.error).toBe("Please select a valid CSV file");
    expect(result.current.file).toBeNull();
  });

  it("should accept files with .csv extension", () => {
    const { result } = renderHook(() => useFileUploader({}));

    const file = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );

    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(event);
    });

    expect(result.current.file).toBe(file);
  });

  it("should accept files with text/csv mime type", () => {
    const { result } = renderHook(() => useFileUploader({}));

    const file = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );

    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(event);
    });

    expect(result.current.file).toBe(file);
  });

  it("should handle upload without file selected", async () => {
    const { result } = renderHook(() => useFileUploader({}));

    await act(async () => {
      await result.current.handleUpload();
    });

    expect(result.current.error).toBe("Please select a file");
  });

  it("should handle successful file upload", async () => {
    const { result } = renderHook(() => useFileUploader({}));

    mockUploadEmployeeCSV.mockResolvedValueOnce({
      success: true,
      message: "Upload successful",
      importedCount: 1,
      failedCount: 0,
    });

    const file = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );

    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(event);
    });

    await act(async () => {
      await result.current.handleUpload();
    });

    await waitFor(() => {
      expect(result.current.uploadResult).not.toBeNull();
      expect(result.current.uploadResult?.success).toBe(true);
    });
  });
  it("should clear error on successful file selection", () => {
    const { result } = renderHook(() => useFileUploader({}));

    const invalidFile = new File(["invalid"], "file.txt", {
      type: "text/plain",
    });

    const invalidEvent = {
      target: { files: [invalidFile] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(invalidEvent);
    });
    expect(result.current.error).not.toBeNull();

    const validFile = new File(
      ["name,age,position,salary\nJohn,30,Manager,5000"],
      "employees.csv",
      { type: "text/csv" }
    );
    const validEvent = {
      target: { files: [validFile] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(validEvent);
    });
    expect(result.current.error).toBeNull();
  });
});
