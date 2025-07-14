"use client";
import { useState, useRef } from "react";

export default function SpotImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер: 4MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки');
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (error: any) {
      alert(`Ошибка загрузки: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      onUpload(imageUrl.trim());
      setImageUrl('');
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
          Загрузить изображение:
        </p>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? '#388e3c' : '#ddd'}`,
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragActive ? '#f0f8f0' : '#f9f9f9',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {uploading ? (
            <div style={{ color: '#388e3c', fontSize: '14px' }}>
              Загрузка...
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>📷</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Нажмите или перетащите изображение сюда
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                JPEG, PNG, GIF, WebP (максимум 4MB)
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Remove the block below: manual URL input and form */}
      {/*
      <div style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
          Или введите URL изображения:
        </p>
        <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '6px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '6px 12px',
              backgroundColor: '#388e3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Добавить
          </button>
        </form>
      </div>
      */}
    </div>
  );
}
