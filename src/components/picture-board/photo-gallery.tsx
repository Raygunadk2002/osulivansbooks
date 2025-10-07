'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, User, X } from 'lucide-react';
import { toast } from 'sonner';

interface Photo {
  id: string;
  user_id: string;
  display_name: string;
  title: string;
  description: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

interface PhotoGalleryProps {
  isAdmin?: boolean;
}

export function PhotoGallery({ isAdmin = false }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      } else {
        toast.error('Failed to load photos');
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Error loading photos');
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can delete photos');
      return;
    }

    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Photo deleted successfully');
        fetchPhotos(); // Refresh the gallery
      } else {
        toast.error('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error deleting photo');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading photos...</div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No photos yet</div>
        <div className="text-gray-400">Be the first to share a photo from your stay!</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Photo */}
              <div 
                className="relative aspect-square cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.file_path}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback for missing images
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                  }}
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="text-white text-center">
                      <div className="text-lg font-semibold">{photo.title}</div>
                      <div className="text-sm">Click to view</div>
                    </div>
                  </div>
                </div>

                {/* Delete button for admins */}
                {isAdmin && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(photo.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Photo Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{photo.title}</h3>
                {photo.description && (
                  <p className="text-gray-600 text-sm mb-3">{photo.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {photo.display_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(photo.uploaded_at)}
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mt-1">
                  {formatFileSize(photo.file_size)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPhoto.title}</h2>
                  <p className="text-gray-600">by {selectedPhoto.display_name}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <img
                src={selectedPhoto.file_path}
                alt={selectedPhoto.title}
                className="w-full max-h-96 object-contain rounded-lg mb-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                }}
              />
              
              {selectedPhoto.description && (
                <p className="text-gray-700 mb-4">{selectedPhoto.description}</p>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>Uploaded on {formatDate(selectedPhoto.uploaded_at)}</div>
                <div>{formatFileSize(selectedPhoto.file_size)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
