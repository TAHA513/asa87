import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export function ProductGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  if (isLoading || !products) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const showNext = () => {
    setCurrentIndex(prev => (prev + 1) % products.length);
  };

  const showPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + products.length) % products.length);
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl py-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={showPrevious} className="absolute left-0 z-10">
          <ChevronRight className="h-6 w-6" />
        </Button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="mx-auto max-w-sm">
              <CardContent className="p-6">
                {products[currentIndex].imageUrl ? (
                  <motion.img
                    src={products[currentIndex].imageUrl}
                    alt={products[currentIndex].name}
                    className="mb-4 h-48 w-full rounded-lg object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                ) : (
                  <div className="mb-4 flex h-48 w-full items-center justify-center rounded-lg bg-muted">
                    لا توجد صورة
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="mb-2 text-xl font-bold">{products[currentIndex].name}</h3>
                  <p className="mb-2 text-muted-foreground">{products[currentIndex].description}</p>
                  <p className="text-lg font-bold text-primary">
                    {Number(products[currentIndex].priceIqd).toLocaleString()} د.ع
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <Button variant="ghost" size="icon" onClick={showNext} className="absolute right-0 z-10">
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {products.map((_, index) => (
          <motion.button
            key={index}
            className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-primary' : 'bg-muted'}`}
            whileHover={{ scale: 1.2 }}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
