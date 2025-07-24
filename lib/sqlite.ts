// lib/sqlite.ts
import Database from 'better-sqlite3';
import { Spot } from './spots';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'spots.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create the tea_spots table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS tea_spots (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    long_description TEXT,
    image TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createTableQuery);

// Seed data from lib/spots.ts if table is empty
const seedData = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM tea_spots').get() as { count: number };
  
  if (count.count === 0) {
    const sampleSpots = [
      {
        id: uuidv4(),
        name: 'Утренний спот',
        description: 'Тихое место для чая и размышлений',
        long_description: 'Тихое место под утренним солнцем, идеально подходит для сенчи или лёгкого улуна. Здесь часто дует лёгкий ветерок и слышны птицы.',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?fit=crop&w=600&q=80',
        lat: 55.7522,
        lng: 37.6156,
      },
      {
        id: uuidv4(),
        name: 'Вечерняя поляна',
        description: 'Закат и травы',
        long_description: 'Поляна на краю леса. После 17:00 сюда падает мягкий свет. Отличное место для чая с друзьями.',
        image: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?fit=crop&w=600&q=80',
        lat: 55.7512,
        lng: 37.6176,
      },
    ];

    const insertStmt = db.prepare(`
      INSERT INTO tea_spots (id, name, description, long_description, image, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    sampleSpots.forEach(spot => {
      insertStmt.run(
        spot.id,
        spot.name,
        spot.description,
        spot.long_description,
        spot.image,
        spot.lat,
        spot.lng
      );
    });

    console.log('Seeded database with sample spots');
  }
};

// Initialize database with seed data
seedData();

// Database operations
export const spotDB = {
  // Get all spots
  getAllSpots: (): Spot[] => {
    const stmt = db.prepare('SELECT id, name, description, long_description as longDescription, image, lat, lng, created_at FROM tea_spots ORDER BY created_at DESC');
    return stmt.all() as Spot[];
  },

  // Get spot by ID
  getSpotById: (id: string): Spot | null => {
    const stmt = db.prepare('SELECT id, name, description, long_description as longDescription, image, lat, lng, created_at FROM tea_spots WHERE id = ?');
    return stmt.get(id) as Spot || null;
  },

  // Create new spot
  createSpot: (spot: Omit<Spot, 'id' | 'created_at'>): Spot => {
    const id = uuidv4();
    const created_at = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO tea_spots (id, name, description, long_description, image, lat, lng, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      spot.name,
      spot.description || '',
      spot.longDescription || '',
      spot.image || '',
      spot.lat,
      spot.lng,
      created_at
    );

    return {
      id,
      name: spot.name,
      description: spot.description || '',
      longDescription: spot.longDescription || '',
      image: spot.image || '',
      lat: spot.lat,
      lng: spot.lng,
      created_at,
    };
  },

  // Update spot
  updateSpot: (id: string, updates: Partial<Omit<Spot, 'id' | 'created_at'>>): Spot | null => {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.longDescription !== undefined) {
      fields.push('long_description = ?');
      values.push(updates.longDescription);
    }
    if (updates.image !== undefined) {
      fields.push('image = ?');
      values.push(updates.image);
    }
    if (updates.lat !== undefined) {
      fields.push('lat = ?');
      values.push(updates.lat);
    }
    if (updates.lng !== undefined) {
      fields.push('lng = ?');
      values.push(updates.lng);
    }

    if (fields.length === 0) {
      return spotDB.getSpotById(id);
    }

    values.push(id);
    const stmt = db.prepare(`UPDATE tea_spots SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    if (result.changes === 0) {
      return null;
    }

    return spotDB.getSpotById(id);
  },

  // Delete spot
  deleteSpot: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM tea_spots WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },
};

// Close database connection on process exit
process.on('exit', () => {
  db.close();
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

export default db;