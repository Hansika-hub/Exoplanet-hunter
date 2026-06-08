import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploaderProps {
  onUpload: (flux: number[]) => void;
  disabled?: boolean;
}

export function Uploader({ onUpload, disabled }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        
        let startIndex = 0;
        // Check for header row
        if (lines.length > 0 && isNaN(parseFloat(lines[0].split(',')[0]))) {
          startIndex = 1;
        }

        const fluxValues: number[] = [];
        for (let i = startIndex; i < lines.length; i++) {
          const cols = lines[i].split(',');
          // Use first column, or second if first is just an index
          let valStr = cols[0];
          if (cols.length > 1 && parseFloat(cols[0]) === i - startIndex) {
             valStr = cols[1];
          }
          
          const val = parseFloat(valStr);
          if (!isNaN(val)) {
            fluxValues.push(val);
          }
        }

        if (fluxValues.length === 0) {
          throw new Error("No numeric flux values found in the file.");
        }

        onUpload(fluxValues);
      } catch (err) {
        toast({
          title: "Failed to parse file",
          description: err instanceof Error ? err.message : "Ensure the file contains numeric flux values.",
          variant: "destructive"
        });
      }
      
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-4">
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        ref={inputRef} 
        onChange={handleFileChange}
        data-testid="input-upload-csv"
      />
      <Button 
        variant="outline" 
        className="w-full border-dashed font-mono"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        data-testid="button-upload-csv"
      >
        <Upload className="w-4 h-4 mr-2" />
        UPLOAD CSV
      </Button>
    </div>
  );
}