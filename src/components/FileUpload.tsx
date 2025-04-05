
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, X, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  bucketName: string;
  onUploadComplete?: (filePath: string, fileData: any) => void;
  acceptedFileTypes?: string[];
  maxSize?: number;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  bucketName,
  onUploadComplete,
  acceptedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  maxSize = 5242880, // 5MB
  className = '',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': acceptedFileTypes.includes('application/pdf') ? ['.pdf'] : [],
      'application/msword': acceptedFileTypes.includes('application/msword') ? ['.doc'] : [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 
        acceptedFileTypes.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ? ['.docx'] : [],
      'text/plain': acceptedFileTypes.includes('text/plain') ? ['.txt'] : [],
    },
    maxSize,
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
  };

  const uploadFile = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Create a unique file path
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) throw error;

      toast.success("File uploaded successfully!");
      
      if (onUploadComplete) {
        onUploadComplete(filePath, {
          name: file.name,
          type: file.type,
          size: file.size,
          path: filePath
        });
      }
      
      setFile(null);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors ${
            isDragActive ? 'bg-primary/10' : ''
          } cursor-pointer`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-sm font-medium">
            {isDragActive ? "Drop the file here" : "Drag & drop file or click to upload"}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Support for PDF, DOCX, or plain text files (max {maxSize / 1024 / 1024}MB)
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={removeFile}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            className="w-full mt-4 bg-jobspark-primary hover:bg-opacity-90"
            onClick={uploadFile}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
