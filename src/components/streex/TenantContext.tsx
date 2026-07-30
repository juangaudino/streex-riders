import { createContext, useContext, type ReactNode } from "react";

type TenantContextValue = {
  tenantId: string;
  tenantSlug: string;
};

const TenantContext = createContext<TenantContextValue>({
  tenantId: "streex",
  tenantSlug: "streex",
});

export function TenantProvider({
  value,
  children,
}: {
  value: TenantContextValue;
  children: ReactNode;
}) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

// The hook intentionally lives with its provider so every tenant-aware landing component shares one context.
// eslint-disable-next-line react-refresh/only-export-components
export function useTenant() {
  return useContext(TenantContext);
}
