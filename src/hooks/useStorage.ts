
import { useState, useEffect } from "react";
import { listFiles, getFileUrl, deleteFile, STORAGE_BUCKETS } from "@/lib/storage-utils";

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
  publicUrl: string;
}

interface UseStorageProps {
  bucketName: string;
  folderPath?: string;
  autoFetch?: boolean;
}

export function useStorage({
  bucketName,
  folderPath = "",
  autoFetch = true,
}: UseStorageProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filesList = await listFiles(bucketName, folderPath);
      
      // Filter out folders and enhance file objects with public URLs
      const enhancedFiles = filesList
        .filter(file => !file.id.endsWith('/')) // Filter out folders
        .map(file => ({
          ...file,
          publicUrl: getFileUrl(bucketName, folderPath ? `${folderPath}/${file.name}` : file.name),
        }));
      
      setFiles(enhancedFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch files"));
    } finally {
      setLoading(false);
    }
  };

  const removeFile = async (fileName: string) => {
    try {
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
      await deleteFile(bucketName, filePath);
      
      // Remove the file from the state
      setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
      
      return true;
    } catch (err) {
      console.error("Error deleting file:", err);
      throw err;
    }
  };

  // Fetch files on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchFiles();
    }
  }, [bucketName, folderPath, autoFetch]);

  return {
    files,
    loading,
    error,
    fetchFiles,
    removeFile,
    bucketUrl: `${window.location.origin}/storage/v1/object/public/${bucketName}`,
  };
}
