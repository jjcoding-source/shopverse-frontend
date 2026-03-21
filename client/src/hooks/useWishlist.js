import { useSelector, useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setWishlist } from "@/store/slices/authSlice";
import { authAPI }     from "@/store/api/authApi";
import { useAuth }     from "@/hooks/useAuth";
import toast           from "react-hot-toast";

export const useWishlist = () => {
  const dispatch      = useDispatch();
  const queryClient   = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Get wishlist IDs from user state
  const wishlistIds = useSelector(
    (s) => s.auth.user?.wishlist || []
  );

  // Check if a product is wishlisted
  const isWishlisted = (productId) => {
    if (!productId) return false;
    return wishlistIds.some((id) =>
      id?.toString() === productId?.toString()
    );
  };

  // Toggle wishlist mutation
  const { mutate: toggleWishlist, isLoading } = useMutation({
    mutationFn: (productId) => authAPI.toggleWishlist(productId),
    onSuccess: (response, productId) => {
      const newWishlist = response.data.wishlist;
      dispatch(setWishlist(newWishlist));
      queryClient.invalidateQueries(["wishlist"]);
      queryClient.invalidateQueries(["me"]);

      const wasWishlisted = isWishlisted(productId);
      toast.success(wasWishlisted ? "Removed from wishlist" : "Added to wishlist");
    },
    onError: () => {
      toast.error("Failed to update wishlist");
    },
  });

  const toggle = (productId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save items");
      return;
    }
    toggleWishlist(productId);
  };

  return {
    wishlistIds,
    isWishlisted,
    toggle,
    isLoading,
  };
};