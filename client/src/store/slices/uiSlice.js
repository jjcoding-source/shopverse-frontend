import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    mobileMenuOpen: false,
    searchOpen: false,
    activeModal: null,
  },
  reducers: {
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    toggleSearch(state) {
      state.searchOpen = !state.searchOpen;
    },
    openModal(state, action) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
  },
});

export const { toggleMobileMenu, toggleSearch, openModal, closeModal } =
  uiSlice.actions;
export default uiSlice.reducer;