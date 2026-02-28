import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/sections/Footer';
import { useAuth } from '@/hooks/useAuth';
import {
  useCartItems,
  useAddresses,
  useCreateAddress,
  useCreateOrder,
  useClearCart,
  useCreatePayment,
} from '@/hooks/useEcommerce';
import { useToast } from '@/hooks/use-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: cartItems = [] } = useCartItems(user?.id || '');
  const { data: addresses = [] } = useAddresses(user?.id || '');
  const createAddress = useCreateAddress();
  const createOrder = useCreateOrder();
  const clearCart = useClearCart();
  const createPayment = useCreatePayment();

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');
  const [loading, setLoading] = useState(false);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const product = item.products;
      const price = product?.sale_price || product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const tax = cartTotal * 0.18;
  const shipping = 50;
  const totalAmount = cartTotal + tax + shipping;

  useEffect(() => {
    if (!user) {
      navigate('/auth/signin');
    }
    if (cartItems.length === 0) {
      navigate('/shop');
    }
  }, [user, cartItems, navigate]);

  const handlePlaceOrder = async () => {
    if (!user || !selectedShippingAddress) {
      toast({
        title: 'Error',
        description: 'Please select shipping address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;

      const itemsToCreate = cartItems.map((item) => {
        // Get product name - CartItem only has products field with full product object
        const productName = item.products?.name || 'Product';
        
        return {
          product_id: item.product_id,
          product_name: productName,
          quantity: item.quantity,
          price_at_purchase: item.products?.price || 0,
          sale_price_at_purchase: item.products?.sale_price || undefined,
        };
      });

      // Create order
      const order = await createOrder.mutateAsync({
        user_id: user.id,
        order_number: orderNumber,
        subtotal: cartTotal,
        tax_amount: tax,
        shipping_amount: shipping,
        total_amount: totalAmount,
        billing_address_id: sameAsShipping
          ? selectedShippingAddress
          : selectedBillingAddress,
        shipping_address_id: selectedShippingAddress,
        items: itemsToCreate,
      });

      // Create payment record
      await createPayment.mutateAsync({
        order_id: order.id,
        amount: totalAmount,
        payment_method: paymentMethod,
      });

      // Clear cart
      await clearCart.mutateAsync(user.id);

      toast({
        title: 'Success',
        description: 'Order placed successfully!',
      });

      navigate(`/order/${order.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || cartItems.length === 0) return null;

  return (
    <div className="flex flex-col h-screen bg-white">
      <Navbar />

      <div className="flex-1 overflow-y-auto mt-16 sm:mt-20 mb-16 sm:mb-20">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif text-foreground">Checkout</h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Complete your purchase</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/shop')}
              className="border-tea-gold text-tea-gold hover:bg-tea-gold/5 w-full sm:w-auto"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 max-w-6xl">
          {/* Main Checkout */}
          <div className="lg:col-span-2">
            <Tabs value={step} onValueChange={(v) => setStep(v as any)}>
              <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
                <TabsTrigger value="shipping" className="text-xs sm:text-sm">Shipping</TabsTrigger>
                <TabsTrigger value="payment" className="text-xs sm:text-sm">Payment</TabsTrigger>
                <TabsTrigger value="confirm" className="text-xs sm:text-sm">Review</TabsTrigger>
              </TabsList>

              {/* Shipping Step */}
              <TabsContent value="shipping" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                <Card className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Shipping Address</h2>

                  {addresses.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className="flex items-start p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={address.id}
                            checked={selectedShippingAddress === address.id}
                            onChange={(e) => setSelectedShippingAddress(e.target.value)}
                            className="mt-1 mr-2 sm:mr-3"
                          />
                          <div className="text-sm sm:text-base">
                            <p className="font-semibold">{address.full_name}</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {address.street_address}, {address.city}, {address.state}{' '}
                              {address.postal_code}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">{address.phone}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : null}

                  <Button
                    onClick={() => setStep('payment')}
                    disabled={!selectedShippingAddress}
                    className="w-full bg-tea-gold hover:bg-tea-gold/90 text-sm sm:text-base"
                  >
                    Continue to Payment
                  </Button>
                </Card>
              </TabsContent>

              {/* Payment Step */}
              <TabsContent value="payment" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                <Card className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Payment Method</h2>

                  <div className="space-y-2 sm:space-y-4">
                    {/* Card Payment */}
                    <label className="flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer text-sm sm:text-base">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="mr-2 sm:mr-3"
                      />
                      <span className="font-semibold">Debit/Credit Card</span>
                    </label>

                    {paymentMethod === 'card' && (
                      <div className="ml-6 sm:ml-8 space-y-2 sm:space-y-3">
                        <Input
                          placeholder="Cardholder Name"
                          value={cardData.name}
                          onChange={(e) =>
                            setCardData({ ...cardData, name: e.target.value })
                          }
                          className="text-sm sm:text-base"
                        />
                        <Input
                          placeholder="Card Number"
                          maxLength={19}
                          value={cardData.number}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              number: e.target.value.replace(/\s/g, ''),
                            })
                          }
                          className="text-sm sm:text-base"
                        />
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <Input
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) =>
                              setCardData({ ...cardData, expiry: e.target.value })
                            }
                            className="text-sm sm:text-base"
                          />
                          <Input
                            placeholder="CVV"
                            type="password"
                            maxLength={3}
                            value={cardData.cvv}
                            onChange={(e) =>
                              setCardData({ ...cardData, cvv: e.target.value })
                            }
                            className="text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    )}

                    {/* UPI Payment */}
                    <label className="flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer text-sm sm:text-base">
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="mr-2 sm:mr-3"
                      />
                      <span className="font-semibold">UPI</span>
                    </label>

                    {paymentMethod === 'upi' && (
                      <div className="ml-6 sm:ml-8">
                        <Input
                          placeholder="UPI ID (yourname@bank)"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="text-sm sm:text-base"
                        />
                      </div>
                    )}

                    {/* Wallet */}
                    <label className="flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer text-sm sm:text-base">
                      <input
                        type="radio"
                        name="payment"
                        value="wallet"
                        checked={paymentMethod === 'wallet'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="mr-2 sm:mr-3"
                      />
                      <span className="font-semibold">Digital Wallet</span>
                    </label>
                  </div>

                  <Button
                    onClick={() => setStep('confirm')}
                    className="w-full bg-tea-gold hover:bg-tea-gold/90 mt-4 sm:mt-6 text-sm sm:text-base"
                  >
                    Review Order
                  </Button>
                </Card>
              </TabsContent>

              {/* Confirm Step */}
              <TabsContent value="confirm" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                <Card className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Review Order</h2>

                  <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Shipping To</p>
                      <p className="font-semibold text-sm sm:text-base">
                        {addresses.find((a) => a.id === selectedShippingAddress)?.full_name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {addresses.find((a) => a.id === selectedShippingAddress)?.street_address}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="font-semibold text-sm sm:text-base capitalize">{paymentMethod}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 mt-4 sm:mt-6 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-4 sm:p-6 sticky top-16 sm:top-20">
              <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-4">Order Summary</h2>

              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b max-h-56 sm:max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <div>
                        <div>{item.products?.name}</div>
                        {item.products?.weight !== undefined && item.products.weight > 0 && (
                          <div className="text-xs text-gray-500">
                            {item.products.weight} {item.products.weight_unit || 'g'}
                          </div>
                        )}
                      </div>
                      <span>x{item.quantity}</span>
                    </div>
                    <div className="text-gray-600 text-xs">
                      ₹{(item.products?.sale_price || item.products?.price).toFixed(2)} each
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-2 sm:pt-4 mt-2 sm:mt-4 flex justify-between text-base sm:text-lg font-bold">
                <span>Total</span>
                <span className="text-tea-gold">₹{totalAmount.toFixed(2)}</span>
              </div>
            </Card>
          </div>
        </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
