import React, { lazy, Suspense } from "react";
import type { EconomicEvent } from "@/components/FinanceDashboard/EconomicCalendar";
import type { NewsItem } from "@/components/FinanceDashboard/MarketNews";

// Lazy load heavy components
const FinanceHub = lazy(
  () => import("@/components/FinanceDashboard/FinanceHub"),
);
const StockList = lazy(() => import("@/components/FinanceDashboard/StockList"));
const StockMovers = lazy(
  () => import("@/components/FinanceDashboard/StockMovers"),
);
const CryptoList = lazy(
  () => import("@/components/FinanceDashboard/CryptoList"),
);
const SectorsList = lazy(
  () => import("@/components/FinanceDashboard/SectorsList"),
);
const IndicesList = lazy(
  () => import("@/components/FinanceDashboard/IndicesList"),
);

/**
 * Loading placeholder skeleton for dashboard sections
 */
function DashboardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#181B22] bg-[rgba(46,39,68,0.30)] p-4 h-[400px]">
      <div className="space-y-3">
        <div className="h-6 bg-[#2A2A3E]/40 rounded w-1/3"></div>
        <div className="h-4 bg-[#2A2A3E]/40 rounded"></div>
        <div className="h-4 bg-[#2A2A3E]/40 rounded"></div>
      </div>
    </div>
  );
}

/**
 * Lazy loaded FinanceHub with Suspense fallback
 */
export const LazyFinanceHub = React.memo(
  ({ events, news }: { events: EconomicEvent[]; news: NewsItem[] }) => (
    <Suspense fallback={<DashboardSkeleton />}>
      <FinanceHub events={events} news={news} />
    </Suspense>
  ),
);

LazyFinanceHub.displayName = "LazyFinanceHub";

/**
 * Lazy loaded StockList with Suspense fallback
 */
export const LazyStockList = React.memo(
  ({ stocks, title }: { stocks: any[]; title: string }) => (
    <Suspense fallback={<DashboardSkeleton />}>
      <StockList stocks={stocks} title={title} />
    </Suspense>
  ),
);

LazyStockList.displayName = "LazyStockList";

/**
 * Lazy loaded StockMovers with Suspense fallback
 */
export const LazyStockMovers = React.memo(
  ({
    rising,
    declining,
    active,
  }: {
    rising: any[];
    declining: any[];
    active: any[];
  }) => (
    <Suspense fallback={<DashboardSkeleton />}>
      <StockMovers rising={rising} declining={declining} active={active} />
    </Suspense>
  ),
);

LazyStockMovers.displayName = "LazyStockMovers";

/**
 * Lazy loaded CryptoList with Suspense fallback
 */
export const LazyCryptoList = React.memo(
  ({ cryptos, title }: { cryptos: any[]; title?: string }) => (
    <Suspense fallback={<DashboardSkeleton />}>
      <CryptoList cryptos={cryptos} title={title} />
    </Suspense>
  ),
);

LazyCryptoList.displayName = "LazyCryptoList";

/**
 * Lazy loaded SectorsList with Suspense fallback
 */
export const LazySectorsList = React.memo(
  ({
    rising,
    declining,
    active,
  }: {
    rising: any[];
    declining: any[];
    active: any[];
  }) => (
    <Suspense fallback={<DashboardSkeleton />}>
      <SectorsList rising={rising} declining={declining} active={active} />
    </Suspense>
  ),
);

LazySectorsList.displayName = "LazySectorsList";

/**
 * Lazy loaded IndicesList with Suspense fallback
 */
export const LazyIndicesList = React.memo(
  ({
    sectorLeaders,
    indices,
    global,
  }: {
    sectorLeaders: any[];
    indices: any[];
    global: any[];
  }) => (
    <Suspense fallback={<DashboardSkeleton />}>
      <IndicesList
        sectorLeaders={sectorLeaders}
        indices={indices}
        global={global}
      />
    </Suspense>
  ),
);

LazyIndicesList.displayName = "LazyIndicesList";
