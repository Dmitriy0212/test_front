"use client";

import css from "./error.module.css";

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function LogoutUserError({ retry }: Props) {
  return (
    <div className={css.wrapper}>
      <p className={css.message}>Something went wrong while logging out.</p>
      <button type="button" className={css.button} onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
