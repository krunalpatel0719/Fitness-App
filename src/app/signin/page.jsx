
"use client";

import React from "react";
import { SignInForm } from "@/components/SignInForm";
import { AuthLayout } from "@/components/AuthLayout";


export default function SignInPage() {
    return (
        <AuthLayout>
          <SignInForm />
        </AuthLayout>
      );
}
