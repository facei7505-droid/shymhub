import type { Category } from '../types';

export const CATEGORY_FALLBACK_IMAGES: Record<Category, string> = {
  roads: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
  lighting: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
  garbage: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=1000&q=80',
  utilities: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80',
  ecology: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=1000&q=80',
  infrastructure: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
};

export function getSafeImageUrl(url?: string, category: Category = 'roads'): string {
  if (!url || url.trim() === '') {
    return CATEGORY_FALLBACK_IMAGES[category];
  }
  return url;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, category: Category = 'roads') {
  const target = e.currentTarget;
  target.onerror = null; // prevent infinite loop
  target.src = CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.roads;
}
