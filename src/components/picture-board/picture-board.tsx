'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Images } from 'lucide-react';
import { PhotoUpload } from './photo-upload';
import { PhotoGallery } from './photo-gallery';
import { useAuth } from '@/components/auth/auth-provider';

export function PictureBoard() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [refreshKey, setRefreshKey] = useState(0);
  const { isUser, isAdmin } = useAuth();

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('gallery');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Picture Board
        </h1>
        <p className="text-gray-600">
          Share photos from your stay at O&apos;Sullivan House
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            Photo Gallery
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Photo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo Gallery
              </CardTitle>
              <CardDescription>
                Photos shared by guests from their stays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoGallery 
                key={refreshKey}
                isAdmin={isAdmin}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          {isUser || isAdmin ? (
            <PhotoUpload onUploadSuccess={handleUploadSuccess} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Login Required
                </h3>
                <p className="text-gray-500 mb-4">
                  Please log in to upload photos to the picture board.
                </p>
                <Button 
                  onClick={() => setActiveTab('gallery')}
                  variant="outline"
                >
                  View Gallery Instead
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
