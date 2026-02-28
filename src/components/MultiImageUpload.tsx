import { useState, useEffect } from 'react';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadProductImage, validateImageFile, deleteProductImage } from '@/lib/imageUpload';
import { useToast } from '@/components/ui/use-toast';

interface ImagePreview {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

interface MultiImageUploadProps {
  onImagesUpload: (images: ImagePreview[]) => void;
  currentImages?: ImagePreview[];
  disabled?: boolean;
  maxImages?: number;
}

export const MultiImageUpload = ({
  onImagesUpload,
  currentImages = [],
  disabled = false,
  maxImages = 6,
}: MultiImageUploadProps) => {
  const [images, setImages] = useState<ImagePreview[]>(currentImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Update images when currentImages changes (for editing existing products)
  useEffect(() => {
    if (currentImages && currentImages.length > 0) {
      setImages(currentImages);
    }
  }, [currentImages]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Check total limit
    if (images.length + files.length > maxImages) {
      toast({
        title: 'Too many images',
        description: `Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`,
        variant: 'destructive',
      });
      return;
    }

    // Process each file
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast({
          title: 'Invalid image',
          description: validation.error || 'Image validation failed',
          variant: 'destructive',
        });
        continue;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ImagePreview = {
          id: `temp-${Date.now()}-${Math.random()}`,
          url: e.target?.result as string,
          file,
          isNew: true,
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async (id: string) => {
    const imageToRemove = images.find((img) => img.id === id);
    
    // If it's an existing image (not newly selected), delete from storage
    if (imageToRemove && !imageToRemove.isNew && imageToRemove.url) {
      try {
        console.log('Deleting image from storage:', imageToRemove.url);
        await deleteProductImage(imageToRemove.url);
        console.log('Image deleted from storage successfully');
      } catch (error) {
        console.error('Error deleting image from storage:', error);
        toast({
          title: 'Warning',
          description: 'Image removed locally, but storage cleanup may need manual review',
          variant: 'destructive',
        });
      }
    }
    
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  const handleUploadImages = async () => {
    const newImages = images.filter((img) => img.isNew && img.file);
    
    if (newImages.length === 0) {
      onImagesUpload(images);
      return;
    }

    setIsUploading(true);
    const uploadedImages: ImagePreview[] = [];

    try {
      for (const image of newImages) {
        if (!image.file) continue;

        setUploadingId(image.id);
        const imageUrl = await uploadProductImage(image.file, `product-${Date.now()}`);
        
        uploadedImages.push({
          ...image,
          url: imageUrl,
          isNew: false,
        });
      }

      // Update images list with uploaded URLs
      const finalImages = images.map((img) => {
        const uploaded = uploadedImages.find((u) => u.id === img.id);
        return uploaded || img;
      });

      setImages(finalImages);
      onImagesUpload(finalImages);

      toast({
        title: 'Success',
        description: `${uploadedImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadingId(null);
    }
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Product Images</p>
          <p className="text-xs text-gray-500">
            {images.length}/{maxImages} images uploaded
          </p>
        </div>
        <span className="text-xs text-gray-500">Max 5MB each (JPEG, PNG, WebP, GIF)</span>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`relative group cursor-move transition-all ${
                draggedOverIndex === index ? 'ring-2 ring-tea-gold' : ''
              }`}
              draggable
              onDragStart={() => setDraggedOverIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedOverIndex !== null && draggedOverIndex !== index) {
                  moveImage(draggedOverIndex, index);
                  setDraggedOverIndex(index);
                }
              }}
              onDragEnd={() => setDraggedOverIndex(null)}
              onDragLeave={() => setDraggedOverIndex(null)}
            >
              <img
                src={image.url}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-tea-gold transition-colors"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <GripVertical size={16} className="text-white" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  disabled={isUploading}
                  className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Order indicator */}
              <div className="absolute top-1 left-1 bg-tea-gold text-white text-xs font-bold px-2 py-1 rounded">
                #{index + 1}
              </div>

              {/* Upload indicator */}
              {image.isNew && uploadingId === image.id && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-tea-gold/30 rounded-lg cursor-pointer hover:border-tea-gold/60 transition-colors bg-tea-gold/5">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <>
                <Loader2 className="animate-spin text-tea-gold mb-2" size={32} />
                <p className="text-sm text-gray-600">Uploading images...</p>
              </>
            ) : (
              <>
                <Upload className="text-tea-gold mb-2" size={32} />
                <p className="text-sm text-gray-600 font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  JPEG, PNG, WebP or GIF (max 5MB each)
                </p>
                <p className="text-xs text-tea-gold font-medium mt-1">
                  {maxImages - images.length} image{maxImages - images.length !== 1 ? 's' : ''} remaining
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            multiple
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading || disabled || !canAddMore}
          />
        </label>
      )}

      {/* Upload Button */}
      {images.some((img) => img.isNew) && (
        <Button
          type="button"
          onClick={handleUploadImages}
          disabled={isUploading || !images.some((img) => img.isNew)}
          className="w-full bg-tea-gold hover:bg-tea-gold/90 text-white font-semibold rounded-lg py-2 transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Uploading...
            </>
          ) : (
            'Upload Images'
          )}
        </Button>
      )}

      {/* Info text */}
      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          💡 Drag images to reorder them. The first image will be used as the thumbnail.
        </p>
      )}
    </div>
  );
};
