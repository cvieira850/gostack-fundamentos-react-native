import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productStorage = await AsyncStorage.getItem('@app:cart');

      if (productStorage) {
        setProducts(JSON.parse(productStorage));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function storageSetData(): Promise<void> {
      await AsyncStorage.setItem('@app:cart', JSON.stringify(products));
    }

    storageSetData();
  }, [products]);

  const addToCart = useCallback(async product => {
    setProducts(state => [...state, { ...product, quantity: 1 }]);
  }, []);

  const increment = useCallback(async id => {
    setProducts(state =>
      state.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      ),
    );
  }, []);

  const decrement = useCallback(async id => {
    setProducts(state =>
      state.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      ),
    );
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
