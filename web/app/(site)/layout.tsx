"use server"

import React, { Suspense } from "react";

// Replaced server actions with server-side fetch to internal API routes
import { headers } from "next/headers";

import { ProductProvider } from "@/hooks/useProduct";
import { ProfileProvider } from "@/hooks/useProfile";
import { OverlayProvider } from "@/hooks/useOverlay";
import { NotificationProvider, NotificationWidget } from "@/hooks/useNotification";
import { ModalProvider } from "@/hooks/useModal";
import { SSEProvider } from "@/hooks/useSSE";
import OverlayBody from "@/components/layouts/overlay-body";
import OverlayTop from "@/components/layouts/overlay-top";
import OverlayRight from "@/components/layouts/overlay-right";

export default async function SiteLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = headers();
  const host = hdrs.get("host") || "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const cookie = hdrs.get("cookie") ?? "";

  const [profileResp, productsResp] = await Promise.all([
    fetch(`${base}/api/auth/profile`, { headers: { Cookie: cookie }, cache: "no-store" }),
    fetch(`${base}/api/images/products`, { headers: { Cookie: cookie }, cache: "no-store" }),
  ]);

  const profileJson = await profileResp.json().catch(() => ({ data: null }));
  const productsJson = await productsResp.json().catch(() => ({ data: null }));

  const profileData = profileJson?.data ?? null;
  const productData = productsJson?.data ?? null;

  if (!profileData?.user || !productData?.products) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileProvider data={profileData.user}>
    <ProductProvider data={productData.products}>
    <SSEProvider>
    <NotificationProvider>
    <ModalProvider>
    <OverlayProvider>
      <Suspense>
        <OverlayBody>{children}</OverlayBody>
        <OverlayTop />
        <OverlayRight />
        <NotificationWidget />
      </Suspense>
    </OverlayProvider>
    </ModalProvider>
    </NotificationProvider>
    </SSEProvider>
    </ProductProvider>
    </ProfileProvider>
  );
}
