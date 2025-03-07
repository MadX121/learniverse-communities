
import { supabase } from "@/integrations/supabase/client";

// Storage bucket names
export const STORAGE_BUCKETS = {
  DASHBOARD: "Dashboard",
  COMMUNITY: "Community",
  INTERVIEW_PREP: "interviewprep",
  PROJECTS: "projects"
};

/**
 * Upload a file to a specific storage bucket
 * 
 * @param bucketName - Name of the bucket to upload to
 * @param filePath - Path where the file will be stored in the bucket
 * @param file - The file to upload
 * @returns A promise resolving to the upload result
 */
export const uploadFile = async (
  bucketName: string,
  filePath: string,
  file: File
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error(`Error uploading to ${bucketName}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Upload error for ${bucketName}:`, error);
    throw error;
  }
};

/**
 * Get a public URL for a file in storage
 * 
 * @param bucketName - Name of the bucket containing the file
 * @param filePath - Path to the file in the bucket
 * @returns The public URL of the file
 */
export const getFileUrl = (bucketName: string, filePath: string) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * List all files in a bucket or a specific folder
 * 
 * @param bucketName - Name of the bucket to list files from
 * @param folderPath - Optional path to a folder in the bucket
 * @returns A promise resolving to an array of file objects
 */
export const listFiles = async (bucketName: string, folderPath?: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath || "");

    if (error) {
      console.error(`Error listing files in ${bucketName}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`List files error for ${bucketName}:`, error);
    throw error;
  }
};

/**
 * Delete a file from storage
 * 
 * @param bucketName - Name of the bucket containing the file
 * @param filePath - Path to the file in the bucket
 * @returns A promise resolving to the deletion result
 */
export const deleteFile = async (bucketName: string, filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`Error deleting file from ${bucketName}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Delete error for ${bucketName}:`, error);
    throw error;
  }
};

/**
 * Download a file from storage
 * 
 * @param bucketName - Name of the bucket containing the file
 * @param filePath - Path to the file in the bucket
 * @returns A promise resolving to the file data
 */
export const downloadFile = async (bucketName: string, filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error(`Error downloading file from ${bucketName}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Download error for ${bucketName}:`, error);
    throw error;
  }
};
