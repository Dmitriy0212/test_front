"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Image from "next/image"; 
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { updateUser, updateAvatar, deleteAvatar } from "@/lib/api/clientApi";
import { CameraIcon, PencilIcon, CloseIcon } from "./Icons";
import css from "./UserModal.module.css";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserModal({ isOpen, onClose }: UserModalProps) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errorName, setErrorName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setAvatarPreview(user.avatarUrl || "");
      setAvatarFile(null); 
      setErrorName("");
    }
  }, [user, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    if (value.trim().length === 0) {
      setErrorName("Name is required");
    } else if (value.trim().length < 2) {
      setErrorName("Name must be at least 2 characters long");
    } else {
      setErrorName("");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setIsLoading(true);

      if (avatarFile) {
        setAvatarFile(null);
        setAvatarPreview(user?.avatarUrl || "");
        return; 
      }

      if (user?.avatarUrl && avatarPreview === user.avatarUrl) {
        await deleteAvatar();
        if (setUser && user) {
          setUser({ ...user, avatarUrl: "" });
        }
        setAvatarPreview("");
      }

      router.refresh();
    } catch (err: any) {
      setErrorName("Error deleting photo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorName("");

    if (!name.trim()) {
      setErrorName("Name is required");
      return;
    }

    if (name.trim().length < 2) {
      setErrorName("Name must be at least 2 characters long");
      return;
    }

    try {
      setIsLoading(true);

      let updatedUserData = await updateUser({ name: name.trim() });

      if (avatarFile) {
        const avatarResponse = await updateAvatar(avatarFile);
        updatedUserData = { ...updatedUserData, avatarUrl: avatarResponse.avatarUrl };
      }

      if (setUser && updatedUserData) {
        setUser(updatedUserData);
      }

      onClose();
      router.refresh();
    } catch (err: any) {
      setErrorName(
        err?.response?.data?.message || err?.message || "Error updating profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={css.backdrop} onClick={handleBackdropClick}>
      <div className={`${css.container} ${avatarPreview ? css.containerHasPhoto : ""}`}>
        <button type="button" className={css.closeButton} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <h2 className={css.title}>Edit profile</h2>

        <form onSubmit={handleSubmit} className={css.form}>
          {avatarPreview ? (
            <label className={css.filledAvatarWrapper} title="Change photo">
              <input type="file" accept="image/*" onChange={handleFileChange} className={css.fileInput} />
              <Image 
                src={avatarPreview} 
                alt="Avatar" 
                width={120} 
                height={120} 
                className={css.avatarImg} 
              />
              <div className={css.editOverlay}>
                <PencilIcon />
              </div>
            </label>
          ) : (
            <label className={css.emptyAvatarCircle} title="Upload photo">
              <input type="file" accept="image/*" onChange={handleFileChange} className={css.fileInput} />
              <CameraIcon />
            </label>
          )}

          {avatarPreview && (
            <button
              type="button"
              className={css.deletePhotoButton}
              onClick={handleRemovePhoto}
              disabled={isLoading}
            >
              Remove photo
            </button>
          )}

          <div className={css.inputWrapper}>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className={`${css.nameInput} ${errorName ? css.inputError : ""}`}
              placeholder="Your name"
            />
            {errorName && <span className={css.errorMessage}>{errorName}</span>}
          </div>

          <button
            type="submit"
            className={`${css.saveButton} ${isLoading ? css.saveButtonDisabled : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}