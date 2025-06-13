"use client";
import { useState } from "react";
import { UploadButton } from "../utils/uploadthing";

export default function SpotImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          setUploading(false);
          if (res && res[0]?.url) {
            onUpload(res[0].url);
          }
        }}
        onUploadError={(error) => {
          setUploading(false);
          alert(`Ошибка загрузки: ${error.message}`);
        }}
        onUploadBegin={() => setUploading(true)}
      />
      {uploading && <div style={{ color: '#388e3c', marginTop: 8 }}>Загрузка...</div>}
    </div>
  );
}
