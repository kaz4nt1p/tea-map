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
          placeholder="Название"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="text"
          placeholder="Краткое описание"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <textarea
          placeholder="Длинное описание"
          value={longDescription}
          onChange={e => setLongDescription(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit">Добавить</button>
          <button type="button" onClick={onCancel}>Отмена</button>
        </div>
      </form>
    </div>
  );
}
