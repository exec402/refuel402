"use client";

import { CloudUpload, FileCheck, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { isAddress } from "viem";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

const extractAddresses = (text: string): string[] => {
  const addressRegex = /0x[a-fA-F0-9]{40}/g;
  const matches = text.match(addressRegex) || [];

  const uniqueAddresses = Array.from(new Set(matches));
  const validAddresses = uniqueAddresses.filter((addr) => isAddress(addr));

  return validAddresses;
};

const parseCSV = (text: string): string[] => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const addresses: string[] = [];

  for (const line of lines) {
    const extracted = extractAddresses(line);
    addresses.push(...extracted);
  }

  return addresses;
};

const parseExcel = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        const workbook = XLSX.read(data, { type: "array" });

        const allAddresses: string[] = [];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          // eslint-disable-next-line
          jsonData.forEach((row: any) => {
            if (Array.isArray(row)) {
              row.forEach((cell) => {
                if (cell) {
                  const extracted = extractAddresses(String(cell));
                  allAddresses.push(...extracted);
                }
              });
            }
          });
        });

        resolve(allAddresses);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

export default function RecipientsUploader({
  onAddressesExtracted,
}: {
  onAddressesExtracted: (addresses: string[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setFileName(file.name);

      try {
        let addresses: string[] = [];
        const fileType = file.name.toLowerCase();

        if (fileType.endsWith(".txt")) {
          const text = await file.text();
          addresses = extractAddresses(text);
        } else if (fileType.endsWith(".csv")) {
          const text = await file.text();
          addresses = parseCSV(text);
        } else if (fileType.endsWith(".xls") || fileType.endsWith(".xlsx")) {
          addresses = await parseExcel(file);
        } else {
          toast.error("Unsupported file type");
          setFileName(null);
          return;
        }

        const uniqueAddresses = Array.from(new Set(addresses));

        if (uniqueAddresses.length === 0) {
          toast.error("No valid addresses found in file");
          setFileName(null);
        } else {
          onAddressesExtracted(uniqueAddresses);
          setAddresses(uniqueAddresses);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error("Failed to process file");
        setFileName(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [onAddressesExtracted]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    onAddressesExtracted([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "bg-accent rounded-lg p-4 flex flex-col items-center cursor-pointer transition-colors border-2 border-dashed",
        isDragging && "border-primary bg-primary/10",
        !isDragging && "border-transparent"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.csv,.xls,.xlsx"
        onChange={handleFileChange}
        className="hidden"
      />

      {fileName ? (
        <div className="flex flex-col justify-center items-center">
          <div className="flex items-center gap-3 px-2 py-1 rounded-md shadow-sm bg-background">
            <FileCheck className="size-6 text-blue-500" />
            <span className="font-medium">{fileName}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClear}
              className="text-muted-foreground/80 hover:bg-blue-500/10 hover:text-blue-500"
            >
              <X className="size-4" />
            </Button>
          </div>
          <span className="text-muted-foreground text-sm mt-1">
            {addresses.length} addresses will be refueled evenly.
          </span>
        </div>
      ) : (
        <>
          <div className="size-14 flex items-center justify-center">
            <CloudUpload
              className={cn("size-8", isProcessing && "animate-pulse")}
            />
          </div>
          <p>
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                Drag and drop a file here, or{" "}
                <span className="text-blue-500 underline">Browse</span>
              </>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            .txt, .csv, .xls, .xlsx
          </p>
        </>
      )}
    </div>
  );
}
