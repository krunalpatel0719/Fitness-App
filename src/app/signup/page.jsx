
"use client";

import React from "react";
import { SignUpForm } from "@/components/SignUpForm";
import { AuthLayout } from "@/components/AuthLayout";

export default function SignUpPage() {
    return (
        <AuthLayout>
          <SignUpForm/>
        </AuthLayout>
      );
}
