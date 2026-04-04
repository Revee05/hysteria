"use client";

import { AuthProvider } from "../lib/context/auth-context.jsx";
import DialogProvider from "../components/ui/DynamicDialogModals.jsx";
import { Toaster } from "sonner";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <DialogProvider>
        {children}
        <Toaster position="top-center" richColors />
      </DialogProvider>
    </AuthProvider>
  );
}
