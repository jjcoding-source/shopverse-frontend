import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";

export const useAuth = () => {
  const { user, token, isAuthenticated, loading } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const signOut = () => dispatch(logout());
  const isAdmin = user?.role === "admin";
  return { user, token, isAuthenticated, loading, signOut, isAdmin };
};