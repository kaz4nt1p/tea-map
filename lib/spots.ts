// lib/spots.ts
export type Spot = {
  id: string;               // UUID
  name: string;
  description: string;
  longDescription: string;
  image: string;
  lat: number;
  lng: number;
  created_at?: string;      // Supabase вернёт этот timestamp
};

export const spots: Spot[] = [
  {
    id: '1',
    name: 'Утренний спот',
    description: 'Тихое место для чая и размышлений',
    longDescription: 'Тихое место под утренним солнцем, идеально подходит для сенчи или лёгкого улуна. Здесь часто дует лёгкий ветерок и слышны птицы.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?fit=crop&w=600&q=80',
    lat: 55.7522,
    lng: 37.6156,
    // ...можно добавить created_at при необходимости...
  },
  {
    id: '2',
    name: 'Вечерняя поляна',
    description: 'Закат и травы',
    longDescription: 'Поляна на краю леса. После 17:00 сюда падает мягкий свет. Отличное место для чая с друзьями.',
    image: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?fit=crop&w=600&q=80',
    lat: 55.7512,
    lng: 37.6176,
    // ...можно добавить created_at при необходимости...
  },
];
