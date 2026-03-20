import { createSlice } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const initialState = {
  items: loadCartFromStorage(),
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { _id, selectedColor, selectedSize } = action.payload;
      const key = `${_id}-${selectedColor}-${selectedSize}`;
      const existing = state.items.find((i) => i.cartKey === key);
      if (existing) {
        existing.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, cartKey: key, quantity: action.payload.quantity || 1 });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.cartKey !== action.payload);
      saveCartToStorage(state.items);
    },
    updateQuantity(state, action) {
      const { cartKey, quantity } = action.payload;
      const item = state.items.find((i) => i.cartKey === cartKey);
      if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.cartKey !== cartKey);
        }
      }
      saveCartToStorage(state.items);
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem("cart");
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart } =
  cartSlice.actions;

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export default cartSlice.reducer;