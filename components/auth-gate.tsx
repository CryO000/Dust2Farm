"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createDemoSession, getDemoSession } from "@/lib/demo-session";
import LoadingScreen from "@/components/loading-screen";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STATIC_DEMO === "true" && !getDemoSession()) {
      createDemoSession(true);
    }
    if (!getDemoSession()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) return <LoadingScreen message="Loading demo farm" />;
  return children;
}
