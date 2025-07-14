const Database = require('better-sqlite3');
const { PrismaClient } = require('./generated/prisma');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

// Connect to SQLite database
const dbPath = path.join(__dirname, '..', 'data', 'spots.db');
const sqlite = new Database(dbPath);

async function migrateData() {
  try {
    console.log('Starting data migration from SQLite to PostgreSQL...');
    
    // Get all spots from SQLite
    const spots = sqlite.prepare('SELECT * FROM tea_spots').all();
    console.log(`Found ${spots.length} spots to migrate`);
    
    // Create a default user for existing spots
    const defaultUser = await prisma.user.create({
      data: {
        email: 'admin@tea-map.com',
        password_hash: 'temp-hash', // This should be properly hashed in production
        username: 'admin',
        display_name: 'Admin User',
        bio: 'Default user for migrated spots',
        is_verified: true,
      },
    });
    
    console.log('Created default user for existing spots');
    
    // Migrate spots
    for (const spot of spots) {
      await prisma.spot.create({
        data: {
          id: spot.id,
          creator_id: defaultUser.id,
          name: spot.name,
          description: spot.description,
          long_description: spot.long_description,
          latitude: spot.lat,
          longitude: spot.lng,
          image_url: spot.image,
          created_at: new Date(spot.created_at || Date.now()),
        },
      });
    }
    
    console.log(`Successfully migrated ${spots.length} spots`);
    
    // Close connections
    sqlite.close();
    await prisma.$disconnect();
    
    console.log('Data migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

migrateData();