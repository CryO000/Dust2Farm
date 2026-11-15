"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getDemoSession } from "@/lib/demo-session";
import LoadingScreen from "@/components/loading-screen";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!getDemoSession()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) return <LoadingScreen message="Connecting to your demo farm..." />;
  return children;
}
