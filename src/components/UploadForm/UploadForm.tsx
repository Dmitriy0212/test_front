"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { updateAvatar } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

import styles from "./UploadForm.module.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const validationSchema = Yup.object({
  photo: Yup.mixed<File>()
    .required("Please select a photo")
    .test("fileSize", "File is too large (max 5MB)", (value) => {
      if (!value) return true;
      return value.size <= MAX_FILE_SIZE;
    })
    .test("fileType", "Please select an image", (value) => {
      if (!value) return true;
      return value.type.startsWith("image/");
    }),
});

export const UploadForm = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [preview, setPreview] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      photo: null as File | null,
    },

    validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      if (!values.photo) {
        toast.error("Please select a photo");
        return;
      }

      try {
        const response = await updateAvatar(values.photo);

        const currentUser = useAuthStore.getState().user;
        if (currentUser && response?.avatarUrl) {
          setUser({ ...currentUser, avatarUrl: response.avatarUrl });
        }

        toast.success("Photo uploaded successfully");
        router.push("/");
      } catch (error: any) {
        toast.error(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Failed to upload photo",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] || null;

    formik.setFieldValue("photo", file);

    if (!file) {
      setPreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large (max 5MB)");
      formik.setFieldValue("photo", null);
      setPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      formik.setFieldValue("photo", null);
      setPreview(null);
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    router.back();
  };

  const hasPhoto = Boolean(formik.values.photo);

  return (
    <div className={styles.wrapper}>
      <section className={styles.card}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
            className={styles.closeIcon}
            aria-hidden="true"
          >
            <use href="/sprite.svg#iconcontrolsclose" />
          </svg>
        </button>

        <h1 className={styles.title}>Upload your photo</h1>

        <form onSubmit={formik.handleSubmit} className={styles.form}>
          <div className={styles.uploadArea}>
            {preview ? (
              <div className={styles.previewWrapper}>
                <Image
                  src={preview}
                  alt="Avatar preview"
                  fill
                  className={styles.previewImage}
                  unoptimized
                />
              </div>
            ) : (
              <div className={styles.cameraCircle}>
                <Image
                  src="/images/photo.svg"
                  alt="Upload photo"
                  width={71}
                  height={60}
                  className={styles.cameraIcon}
                />
              </div>
            )}

            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className={`${styles.submitButton} ${
              hasPhoto ? styles.submitButtonActive : ""
            }`}
          >
            {formik.isSubmitting ? "Saving..." : "Save"}
          </button>
        </form>
      </section>
    </div>
  );
};