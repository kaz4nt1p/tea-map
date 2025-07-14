import { useState } from 'react';
import { Spot } from '../lib/spots';
import SpotImageUploader from './SpotImageUploader';

interface SpotFormProps {
  lat: number;
  lng: number;
  onSubmit: (spot: Omit<Spot, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export default function SpotForm({ lat, lng, onSubmit, onCancel }: SpotFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, longDescription, image, lat, lng });
  };

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, maxWidth: 400, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <h2>Добавить новый спот</h2>
      <form onSubmit={handleSubmit}>
        <SpotImageUploader onUpload={setImage} />
        {image && (
          <img src={image} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'contain', marginBottom: 10, borderRadius: 6 }} />
        )}
        <input
          type="text"
          placeholder="Название (обязательно)"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ 
            width: '100%', 
            marginBottom: 10, 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd' 
          }}
        />
        <input
          type="text"
          placeholder="Краткое описание"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ 
            width: '100%', 
            marginBottom: 10, 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd' 
          }}
        />
        <textarea
          placeholder="Длинное описание"
          value={longDescription}
          onChange={e => setLongDescription(e.target.value)}
          rows={3}
          style={{ 
            width: '100%', 
            marginBottom: 10, 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ddd',
            resize: 'vertical'
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            type="submit" 
            style={{
              padding: '10px 20px',
              backgroundColor: '#388e3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Добавить
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ccc',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
