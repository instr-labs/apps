"use server"

import React, { Suspense } from "react";

import { ProductProvider } from "@/hooks/useProduct";
import { ProfileProvider } from "@/hooks/useProfile";
import { OverlayProvider } from "@/hooks/useOverlay";
import { NotificationProvider, NotificationWidget } from "@/hooks/useNotification";
import { ModalProvider } from "@/hooks/useModal";
import { SSEProvider } from "@/hooks/useSSE";
import OverlayBody from "@/components/layouts/overlay-body";
import OverlayTop from "@/components/layouts/overlay-top";
import OverlayRight from "@/components/layouts/overlay-right";
import { fetchGET } from "@/utils";
import { User } from "@/types/user";
import { Product } from "@/types/product";

export default async function SiteLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  const profileRes = await fetchGET<{ user: User }>(
    "/api/auth/profile",
    { cache: "no-store" }
  );
  const productRes = await fetchGET<{ products: Product[] }>(
    "/api/images/products"
  )

  if (!profileRes.success) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileProvider data={profileRes.data!.user!}>
    <ProductProvider data={productRes.data!.products!}>
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
