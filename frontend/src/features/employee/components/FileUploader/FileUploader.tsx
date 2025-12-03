import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useFileUploader } from "./useFileUploader";

interface UploadEmployeeCSVProps {
  onSuccess?: () => void;
}

export function FileUploader({ onSuccess }: UploadEmployeeCSVProps) {
  const {
    open,
    uploadResult,
    uploadProgress,
    file,
    loading,
    error,
    setOpen,
    handleFileChange,
    handleOpenChange,
    handleUpload,
  } = useFileUploader({ onSuccess });
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <Upload className="w-4 h-4" />
        Upload CSV
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Employee CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple employees at once. The file
              should have columns: name, age, position, salary.
            </DialogDescription>
          </DialogHeader>

          {uploadResult ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                )}
                <div className="space-y-1">
                  <p className="font-medium text-sm">{uploadResult.message}</p>

                  <Progress
                    value={uploadProgress?.progress ?? 0}
                    className="h-2"
                  />
                  {uploadResult.importedCount && (
                    <p className="text-sm text-muted-foreground">
                      Imported: {uploadResult.importedCount} employees
                    </p>
                  )}
                  {uploadResult.failedCount && (
                    <p className="text-sm text-muted-foreground">
                      Failed: {uploadResult.failedCount} rows
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : uploadProgress ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {uploadProgress.message || "Processing upload..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress.progress ?? 0}%
                  </p>
                </div>
                <Progress
                  value={uploadProgress.progress ?? 0}
                  className="h-2"
                />
              </div>

              {uploadProgress.importedCount !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Imported: {uploadProgress.importedCount} employees
                </div>
              )}

              {uploadProgress.status === "FAILED" && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-200">
                      Upload failed. {uploadProgress.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="cursor-pointer"
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-900 dark:text-blue-200">
                  <strong>CSV Format:</strong> The file should contain the
                  following columns (comma-separated):
                </p>
                <pre className="text-xs text-blue-800 dark:text-blue-300 mt-2 font-mono overflow-x-auto">
                  name,age,position,salary{"\n"}John Doe,30,Manager,5000{"\n"}
                  Jane Smith,28,Developer,4500
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading || uploadProgress?.status === "PROCESSING"}
            >
              Close
            </Button>
            {!uploadResult && !uploadProgress && (
              <Button onClick={handleUpload} disabled={!file || loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Uploading..." : "Upload"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
