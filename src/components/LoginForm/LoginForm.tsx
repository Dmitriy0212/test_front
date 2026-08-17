"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";

import Link from "next/link";
import toast from "react-hot-toast";
import css from "./LoginForm.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginSchema } from "@/lib/validation/authSchemas";
import { login } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

const initialValues = {
  email: "",
  password: "",
};

export const LoginForm = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className={css.container}>
      <h2 className={css.title}>Login</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const user = await login(values);

            setUser(user);

            router.push("/profile");
          } catch (error: any) {
            toast.error(
              error.response?.data?.error || error.response?.data?.message || "Login failed",
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className={css.form}>
            <div className={css.field}>
              <label htmlFor="email" className={css.label}>
                Enter your email address
              </label>

              <Field
                id="email"
                className={
                  errors.email && touched.email ? `${css.input} ${css.inputError}` : css.input
                }
                name="email"
                type="email"
                placeholder="Enter your email address"
              />

              <ErrorMessage name="email" component="span" className={css.error} />
            </div>

            <div className={css.field}>
              <label htmlFor="password" className={css.label}>
                Enter a password
              </label>

              <div className={css.passwordWrapper}>
                <Field
                  id="password"
                  className={
                    errors.password && touched.password
                      ? `${css.input} ${css.inputError}`
                      : css.input
                  }
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a password"
                />

                <button
                  type="button"
                  className={css.eyeButton}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <svg className={css.eyeIcon} aria-hidden="true">
                    <use
                      href={
                        showPassword
                          ? "/sprite.svg#icon-Controlseye"
                          : "/sprite.svg#icon-Controlseye-crossed"
                      }
                    />
                  </svg>
                </button>
              </div>

              <ErrorMessage name="password" component="span" className={css.error} />
            </div>

            <button type="submit" className={css.button} disabled={isSubmitting}>
              Login
            </button>

            <div className={css.loginText}>
              Don’t have an account?
              <Link href="/register" className={css.register}>
                Register
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
