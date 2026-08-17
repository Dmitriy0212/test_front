"use client";

import { useState } from "react";
import EditArticleButton from "@/components/EditArticleButton/EditArticleButton";
import UserModal from "@/components/UserModal/UserModal";
import css from "./EditNicknameButton.module.css";

export default function EditNicknameButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <EditArticleButton
        aria-label="Edit nickname"
        className={css.button}
        onClick={() => setIsModalOpen(true)}
      />

      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}