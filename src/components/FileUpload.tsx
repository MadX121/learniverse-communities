
import { useState } from "react";
import { uploadFile, getFileUrl } from "@/lib/storage-utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface FileUploadProps {
  bucketName: string;
  folderPath?: string;
  allowedFileTypes?: string[];
  maxSizeMB?: number;
  onUploadComplete?: (filePath: string, url: string) => void;
}

const FileUpload = ({
  bucketName,
  folderPath = "",
  allowedFileTypes = [],
  maxSizeMB = 5,
  onUploadComplete,
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type if restrictions are provided
    if (allowedFileTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedFileTypes.includes(`.${fileExtension}`)) {
        toast({
          title: "Invalid file type",
          description: `Please upload a file with one of these extensions: ${allowedFileTypes.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create a unique filename using timestamp
      const timestamp = new Date().getTime();
      const uniqueFilename = `${timestamp}_${file.name}`;
      
      // Construct the complete file path
      const filePath = folderPath ? `${folderPath}/${uniqueFilename}` : uniqueFilename;

      // Upload the file
      await uploadFile(bucketName, filePath, file);

      // Get the public URL
      const publicUrl = getFileUrl(bucketName, filePath);

      toast({
        title: "Upload successful",
        description: "Your file has been uploaded.",
      });

      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(filePath, publicUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="relative inline-flex items-center gap-2">
        <Button
          variant="outline"
          className="cursor-pointer"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Choose File"
          )}
        </Button>
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isUploading}
          accept={allowedFileTypes.join(',')}
        />
      </label>
      {allowedFileTypes.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Allowed file types: {allowedFileTypes.join(', ')}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
