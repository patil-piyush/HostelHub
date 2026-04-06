import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import API from "@/api";

export default function UploadCGPA() {

  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    await API.post("/admin/allocation-cycle/upload-cgpa", formData);
    setLoading(false);
  };

  return (
    <div className="space-y-4">

      <Button onClick={() => fileRef.current?.click()}>
        Upload CGPA CSV
      </Button>

      <input
        ref={fileRef}
        type="file"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />

      {loading && <p>Uploading...</p>}

    </div>
  );
}