import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  selectCartTotal,
  selectCartCount,
} from "@/store/slices/cartSlice";

export const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const isOpen = useSelector((s) => s.cart.isOpen);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  return {
    items,
    isOpen,
    total,
    count,
    addItem: (item) => dispatch(addToCart(item)),
    removeItem: (key) => dispatch(removeFromCart(key)),
    updateQty: (key, qty) => dispatch(updateQuantity({ cartKey: key, quantity: qty })),
    clear: () => dispatch(clearCart()),
    toggle: () => dispatch(toggleCart()),
  };
};