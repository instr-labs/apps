"use client";

import React from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/actions/button";
import TextField from "@/components/inputs/text-field";
import InputPin from "@/components/inputs/input-pin";

import useNotification from "@/hooks/useNotification";
import InlineSpinner from "@/components/feedback/InlineSpinner";
import { useRouter } from "next/navigation";

type FormEmailValues = {
  email: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"email" | "pin">("email");
  return (
    <>
      {state === "email" && (
        <FormEmail setEmail={setEmail} next={() => { setState("pin") }} />
      )}
      {state === "pin" && (
        <FormPin email={email} next={() => router.replace("/") } />
      )}
    </>
  )
}

function FormEmail({ setEmail, next }: {
  setEmail: (email: string) => void,
  next: () => void,
}) {
  const [loading, setLoading] = React.useState(false);
  const { showNotification } = useNotification();
  const {
    register,
    handleSubmit,
  } = useForm<FormEmailValues>({
    defaultValues: { email: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (values: FormEmailValues) => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-pin", {
        method: "POST",
        body: JSON.stringify({ email: values.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification({
          type: "error",
          message: data.message || "Failed to send PIN",
        });
        return;
      }

      setEmail(values.email);
      next();
    } catch (e) {
      showNotification({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to send PIN"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3 className="text-center text-3xl font-semibold">Log in to Labs</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField
          type="email"
          placeholder="Email Address"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />
        <Button
          type="submit"
          xVariant="solid"
          disabled={loading}
        >
          <div className="flex items-center justify-center gap-2">
            {loading && <InlineSpinner />} <span>Continue with Email</span>
          </div>
        </Button>
      </form>
    </>
  );
}


function FormPin({ email, next }: {
  email: string,
  next: () => void,
}) {
  const [loading, setLoading] = React.useState(false);
  const [values, setValues] = React.useState<string[]>(Array(6).fill(""));
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin: values.join("") }),
      });
      const json = await res.json();
      if (json.success) {
        next();
      } else {
        showNotification({
          type: "error",
          message: json.message || "Login failed",
        });
      }
    } catch (e) {
      showNotification({ type: "error", message: e instanceof Error ? e.message : "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3 className="text-center text-3xl font-semibold">Verification</h3>
      <p className="text-center text-white/70">
        If you have an account, we have sent a code to <b>{email}</b>. Enter it below.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="mx-auto">
          <InputPin values={values} onChange={setValues} />
        </div>
        <Button
          type="submit"
          xVariant="solid"
          disabled={loading}
        >
          <div className="flex items-center justify-center gap-2">
            {loading && <InlineSpinner />} <span>Continue</span>
          </div>
        </Button>
      </form>
    </>
  );
}
