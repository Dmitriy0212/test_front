"use client";

import { useRouter } from "next/navigation";
import LogoutModal from "../../../components/LogoutModal/LogoutModal";
import { logout } from "../../../lib/api/clientApi";
import { useAuthStore } from "../../../lib/store/authStore";
import css from "./LogoutUserModal.module.css";

export default function LogoutUserModalClient() {
  const router = useRouter();

  const clearIsAuthenticated = useAuthStore((state) => state.clearIsAuthenticated);

  const handleLogoutUser = async () => {
    try {
      await logout();
      clearIsAuthenticated();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <LogoutModal onClose={handleClose}>
      <div className={css.container}>
        <h3 className={css.title}>Are you sure?</h3>

        <p className={css.message}>We will miss you!</p>

        <div className={css.containerButtons}>
          <button type="button" className={css.buttonLogout} onClick={handleLogoutUser}>
            Log out
          </button>

          <button type="button" className={css.buttonCancel} onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </LogoutModal>
  );
}
