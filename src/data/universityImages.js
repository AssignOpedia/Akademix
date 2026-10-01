import campusPhotos from './universityCampusPhotos.json'
import { universities } from './universities'

const fallbackPhotos = [
  'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80',
]

export function getUniversityCampusPhoto(universityId) {
  const localPhoto = campusPhotos[universityId]
  if (localPhoto) return localPhoto

  const index = universities.findIndex((university) => university.id === universityId)
  return {
    url: fallbackPhotos[(index < 0 ? 0 : index) % fallbackPhotos.length],
    source: '',
    artist: '',
    license: '',
  }
}

export function getUniversityCampusImage(universityId) {
  return getUniversityCampusPhoto(universityId).url
}
