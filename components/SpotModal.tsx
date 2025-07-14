import { Spot } from '../lib/spots';

export default function SpotModal({
  spot,
  onClose,
}: {
  spot: Spot;
  onClose: () => void;
}) {
  if (!spot) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', // ← убрали лишний символ
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 20,
          borderRadius: 8,
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <img
          src={spot.image}
          alt={spot.name}
          style={{ width: '100%', borderRadius: 4 }}
        />
        <h2>{spot.name}</h2>
        <p>{spot.description}</p>
        <p style={{ fontSize: 14, color: '#555' }}>
          {spot.longDescription}
        </p>
        <button onClick={onClose} style={{ marginTop: 10 }}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
