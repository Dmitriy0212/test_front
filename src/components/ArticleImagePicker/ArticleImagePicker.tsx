'use client';

import { useState } from 'react';
import Image from 'next/image';
import css from './ArticleImagePicker.module.css';

type Props = {
  file: File | null;
  imageUrl?: string;
  onChange: (file: File | null) => void;
};

export const ArticleImagePicker = ({
  file,
  imageUrl,
  onChange,
}: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');

    if (!selectedFile) {
      setPreviewUrl('');
      onChange(null);
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError('Only images allowed');
      return;
    }

    if (selectedFile.size > 1 * 1024 * 1024) {
      setError('Max file size 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);

    onChange(selectedFile);
  };

  const imageSrc = previewUrl || imageUrl;

  return (
    <div className={css.imageBlock}>
      <label htmlFor="img" className={css.uploadLabel}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt="Preview"
            fill
            className={css.previewImage}
          />
        ) : (
          <div className={css.placeholder}>
            <svg className={css.icon}>
              <use href="/sprite.svg#icon-camera" />
            </svg>
          </div>
        )}
      </label>

      <input
        id="img"
        name="img"
        type="file"
        accept="image/*"
        className={css.hiddenInput}
        onChange={handleFileChange}
      />

      {error && <p className={css.error}>{error}</p>}
    </div>
  );
};

