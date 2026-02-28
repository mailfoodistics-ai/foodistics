import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAddToCart } from '@/hooks/useEcommerce';
import { useToast } from '@/components/ui/use-toast';
import { useProductImages } from '@/hooks/useProductImages';
import { Star } from 'lucide-react';

interface ProductModalProps {
  product: any;
  reviews?: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckoutOpen?: () => void;
  onBuyNow?: (product: any, quantity: number) => void;
}

export function ProductModal({
  product,
  reviews = [],
  open,
  onOpenChange,
  onCheckoutOpen,
  onBuyNow,
}: ProductModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const addToCart = useAddToCart();
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  
  // Fetch all product images
  const productId = product?.id;
  const { data: productImages = [], isLoading: imagesLoading } = useProductImages(productId || '');

  const salePrice = product?.sale_price && product.sale_price > 0 ? product.sale_price : product?.price;
  const discount = product?.sale_price && product.sale_price > 0
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;
  
  // Build image array with fallback - only include valid images
  const validImages = productImages
    .filter((img: any) => img && img.image_url)
    .map((img: any) => img.image_url);
  
  const allImages = validImages.length > 0 
    ? validImages
    : (product?.image_url ? [product.image_url] : ['/tea-leaf.svg']);
  
  // Reset selectedImageIndex if it's out of bounds
  const validIndex = Math.min(selectedImageIndex, allImages.length - 1);
  const currentImage = allImages[validIndex] || '/tea-leaf.svg';
  
  const averageRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to sign in to add items to cart',
        variant: 'destructive',
      });
      onOpenChange(false);
      navigate('/auth/signin');
      return;
    }

    try {
      await addToCart.mutateAsync({
        userId: user.id,
        productId: product.id,
        quantity,
      });
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add to cart',
        variant: 'destructive',
      });
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to sign in to checkout',
        variant: 'destructive',
      });
      onOpenChange(false);
      navigate('/auth/signin');
      return;
    }

    // Close product modal and open checkout modal directly with this product
    onOpenChange(false);
    
    // Call onBuyNow callback with product and quantity
    setTimeout(() => {
      if (onBuyNow) {
        onBuyNow(product, quantity);
      } else if (onCheckoutOpen) {
        // Fallback if onBuyNow is not provided
        onCheckoutOpen();
      }
      setIsBuyingNow(false);
    }, 100);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-y-auto rounded-lg p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-6">
          {/* Product Image Gallery */}
          <div className="flex flex-col gap-1 sm:gap-2 md:gap-4">
            {/* Main Image with Navigation */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden w-full aspect-square">
              {imagesLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-gray-400">Loading images...</div>
                </div>
              ) : (
                <>
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/tea-leaf.svg';
                    }}
                  />
                  
                  {/* Navigation Arrows - Only show if multiple images */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 sm:p-2 rounded-full transition-colors shadow-lg z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={16} className="sm:w-5 sm:h-5 text-gray-800" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 sm:p-2 rounded-full transition-colors shadow-lg z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight size={16} className="sm:w-5 sm:h-5 text-gray-800" />
                      </button>

                      {/* Image Counter */}
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/70 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-semibold">
                        {validIndex + 1}/{allImages.length}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Thumbnail Carousel - Only show if multiple images */}
            {allImages.length > 1 && !imagesLoading && (
              <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-2">
                {allImages.map((image: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === validIndex
                        ? 'border-tea-gold shadow-lg'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/tea-leaf.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Badge Section */}
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {product.is_bestseller && (
                <Badge className="bg-tea-gold text-white text-xs sm:text-sm py-0.5 px-1.5 sm:px-3 gap-0.5 sm:gap-1 flex items-center">
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                  Bestseller
                </Badge>
              )}
              
              {discount > 0 && (
                <Badge className="bg-red-500 text-white text-xs sm:text-sm py-0.5 px-1.5 sm:px-3">
                  {discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-2 sm:gap-3 md:gap-6">
            {/* Title and Category */}
            <div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold font-serif mb-2 sm:mb-3">{product.name}</h2>
              {product.categories && (
                <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-tea-gold to-tea-gold/80 text-white text-xs sm:text-sm font-bold uppercase tracking-wide rounded-full shadow-md">
                  {product.categories.name}
                </span>
              )}
            </div>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`sm:w-5 sm:h-5 ${
                        i < Math.round(Number(averageRating))
                          ? 'fill-tea-gold text-tea-gold'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600">
                  {averageRating} ({reviews.length})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="border-t pt-1 sm:pt-2 md:pt-4">
              <p className="text-gray-600 text-xs sm:text-sm mb-0.5 sm:mb-2">Price</p>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl md:text-4xl font-bold text-tea-gold">
                  ₹{(salePrice || product?.price || 0).toFixed(0)}
                </span>
                {product?.sale_price && product.sale_price > 0 ? (
                  <span className="text-xs sm:text-lg line-through text-gray-400">
                    ₹{(product.price || 0).toFixed(0)}
                  </span>
                ) : null}
              </div>
            </div>
            {product.weight !== undefined && product.weight > 0 && (
            <div className="mt-2 sm:mt-3">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Weight</p>
              <div className="text-sm text-gray-800 font-medium">
                {product.weight} {product.weight_unit || 'g'}
              </div>
            </div>
            )}

            {/* Description */}
            <div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div>
              {product.stock > 0 ? (
                <Badge className="bg-green-500 text-white text-xs sm:text-sm">
                  In Stock ({product.stock})
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs sm:text-sm">Out of Stock</Badge>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm font-medium">Qty</span>
                <div className="flex items-center gap-1 sm:gap-2 border rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={14} className="sm:w-4 sm:h-4" />
                  </Button>
                  <span className="w-6 sm:w-8 text-center font-semibold text-xs sm:text-sm">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                  >
                    <Plus size={14} className="sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-4 pt-2 sm:pt-4 border-t">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="flex-1 border-tea-gold text-tea-gold hover:bg-tea-gold hover:text-white text-xs sm:text-sm h-9 sm:h-10"
                disabled={!product.stock}
              >
                <ShoppingCart size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                onClick={handleBuyNow}
                className="flex-1 bg-tea-gold hover:bg-tea-gold/90 text-white text-xs sm:text-sm h-9 sm:h-10"
                disabled={!product.stock}
              >
                Buy Now
              </Button>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="border-t pt-2 sm:pt-4">
                <h3 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-4">Reviews</h3>
                <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                  {reviews.map((review: any) => (
                    <Card key={review.id} className="p-2 sm:p-3 bg-gray-50 border-0">
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <span className="font-medium text-xs sm:text-sm">
                          {review.users?.full_name || 'Anonymous'}
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={`sm:w-4 sm:h-4 ${
                                i < review.rating
                                  ? 'fill-tea-gold text-tea-gold'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700">{review.comment}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
