"use client";
import { useAuthStore } from "@/lib/store/authStore";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Link from "next/link";
import toast from "react-hot-toast";
import css from "./RegisterForm.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/api/clientApi";
import { registerSchema } from "@/lib/validation/authSchemas";

const initialValues = {
  name: "",
  email: "",
  password: "",
  repeatPassword: "",
};

export const RegisterForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  return (
    <div className={css.content}>
      <div className={`container ${css.container}`}>
        <h2 className={css.title}>Register</h2>

        <p className={css.text}>Join our community of mindfulness and wellbeing!</p>

        <Formik
          initialValues={initialValues}
          validationSchema={registerSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const { repeatPassword, ...registerData } = values;

              const user = await register(registerData);

              useAuthStore.getState().setUser(user);

              router.push("/photo");
            } catch (error: any) {
              toast.error(
                error.response?.data?.error ||
                  error.response?.data?.message ||
                  "Registration failed",
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className={css.formRegister}>
              <div className={css.field}>
                <label htmlFor="name" className={css.label}>
                  Enter your name
                </label>

                <Field
                  id="name"
                  className={
                    errors.name && touched.name ? `${css.input} ${css.inputError}` : css.input
                  }
                  name="name"
                  placeholder="Enter your name"
                />

                <ErrorMessage name="name" component="span" className={css.error} />
              </div>

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
                  Create a strong password
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
                    placeholder="Create a strong password"
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

              <div className={css.field}>
                <label htmlFor="repeatPassword" className={css.label}>
                  Repeat your password
                </label>

                <div className={css.passwordWrapper}>
                  <Field
                    id="repeatPassword"
                    className={
                      errors.repeatPassword && touched.repeatPassword
                        ? `${css.input} ${css.inputError}`
                        : css.input
                    }
                    name="repeatPassword"
                    type={showRepeatPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                  />

                  <button
                    type="button"
                    className={css.eyeButton}
                    onClick={() => setShowRepeatPassword((prev) => !prev)}
                    aria-label={showRepeatPassword ? "Hide password" : "Show password"}
                  >
                    <svg className={css.eyeIcon} aria-hidden="true">
                      <use
                        href={
                          showRepeatPassword
                            ? "/sprite.svg#icon-Controlseye"
                            : "/sprite.svg#icon-Controlseye-crossed"
                        }
                      />
                    </svg>
                  </button>
                </div>

                <ErrorMessage name="repeatPassword" component="span" className={css.error} />
              </div>

              <button type="submit" className={css.button} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create account"}
              </button>

              <div className={css.loginText}>
                Already have an account?
                <Link href="/login" className={css.logIn}>
                  Log in
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
