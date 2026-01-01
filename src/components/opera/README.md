# Opera PMS Integration Components

Bu qovluq Oracle Opera Property Management System ilə inteqrasiya üçün hazırlanmış React komponentlərini ehtiva edir.

## 📦 Komponentlər

### 1. **Package Performance Dashboard** (`PackagePerformanceDashboard.tsx`)
Opera-specific paket performans analizi dashboard-u.

**Xüsusiyyətlər:**
- 📊 **KPI Metrics**: Occupancy, ADR, RevPAR, utilization rate
- 🎯 **Opera Integration**: Opera PMS məlumatları ilə sinxronizasiya
- 📈 **Trend Analysis**: Müddət üzrə performans trendləri
- 🏆 **Market Positioning**: Rəqabət mövqeyi analizi
- 📅 **Seasonal Performance**: Mövsümi performans müqayisəsi

**İstifadə:**
```typescript
<PackagePerformanceDashboard
  dateRange={{ start: '2024-01-01', end: '2024-12-31' }}
  selectedPackageId={1}
/>
```

---

### 2. **Package Comparison Tool** (`PackageComparisonTool.tsx`)
Paketlər arası müqayisə aləti.

**Xüsusiyyətlər:**
- 🔍 **Side-by-Side Comparison**: 2-4 paket arası müqayisə
- 💰 **Price Analysis**: Qiymət fərqləri və dəyər təklifi
- 🧩 **Component Overlap**: Paket komponentlərinin üst-üstə düşməsi
- 📊 **Performance Metrics**: Gəlir, tutum, səmərəlilik göstəriciləri
- 🎯 **Recommendation Engine**: Optimal paket tövsiyələri

**İstifadə:**
```typescript
<PackageComparisonTool
  dateRange={{ start: '2024-01-01', end: '2024-12-31' }}
  initialPackageIds={[1, 2]}
/>
```

---

### 3. **Package Revenue Analytics** (`PackageRevenueAnalytics.tsx`)
Paket gəlir analizi və rentabellik hesablaması.

**Xüsusiyyətlər:**
- 💵 **Revenue Breakdown**: Mənbələr üzrə gəlir bölgüsü
- 📈 **Profitability Analysis**: Rentabellik və ROI hesablaması
- 🧩 **Component Profitability**: Hər komponentin rentabelliyi
- 📊 **Channel Performance**: Booking kanalları üzrə performans
- 📅 **Seasonal Trends**: Mövsümi gəlir trendləri
- 💰 **Cost Analysis**: Xərc və marja analizi

**Hesablanan Metrikalar:**
- Total Revenue & Bookings
- Contribution Margin & Profit Margin
- ROI (Return on Investment)
- Payback Period
- Average Revenue per Booking

**İstifadə:**
```typescript
<PackageRevenueAnalytics
  packageId={1}
  dateRange={{ start: '2024-01-01', end: '2024-12-31' }}
/>
```

## 🔗 API Integration

### Backend Endpoints
```typescript
// Package Performance
GET /api/v1/packages/{id}/performance
GET /api/v1/packages/{id}/opera-metrics

// Package Comparison
POST /api/v1/packages/compare
GET /api/v1/packages/{id}/comparison-data

// Opera Sync
GET /api/v1/opera/sync-status
POST /api/v1/opera/sync
POST /api/v1/opera/resolve-conflict

// Revenue Analytics
GET /api/v1/packages/{id}/revenue-analytics
GET /api/v1/packages/{id}/component-profitability
```

### Opera PMS API
```typescript
// Opera Integration Endpoints
GET /opera/packages
GET /opera/packages/{code}/performance
POST /opera/sync
GET /opera/conflicts
```

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Tablet və desktop optimizasiyası
- Adaptive layouts

### Data Visualization
- Progress bars və charts
- KPI cards with color coding
- Trend indicators (up/down arrows)
- Interactive tables və filters

### Real-Time Updates
- WebSocket integration for live sync
- Auto-refresh capabilities
- Real-time conflict notifications

## 🔧 Configuration

### Environment Variables
```env
# Opera PMS Integration
VITE_OPERA_API_URL=https://opera-api.hotel.com
VITE_OPERA_API_KEY=your-opera-api-key
VITE_OPERA_HOTEL_CODE=HOTEL001

# Sync Settings
VITE_AUTO_SYNC_INTERVAL=30
VITE_MAX_CONFLICT_RESOLUTION_ATTEMPTS=3
```

### Component Props
```typescript
interface CommonProps {
  dateRange?: { start: string; end: string };
  autoRefresh?: boolean;
  refreshInterval?: number;
  theme?: 'light' | 'dark';
}
```

## 🐛 Error Handling

### Sync Errors
- Connection timeouts
- API authentication failures
- Data validation errors
- Conflict resolution failures

### Data Errors
- Missing package mappings
- Invalid Opera data format
- Currency conversion issues
- Date range validation

## 📊 Performance Optimization

### Lazy Loading
- Component-based code splitting
- Data virtualization for large datasets
- Image lazy loading

### Caching Strategy
- API response caching
- Local storage for offline mode
- Background sync for performance

### Memory Management
- Proper cleanup of subscriptions
- Efficient re-rendering prevention
- Garbage collection optimization

## 🧪 Testing

### Unit Tests
```typescript
describe('PackagePerformanceDashboard', () => {
  it('should display KPIs correctly', () => {
    // Test KPI calculations
  });

  it('should handle Opera sync status', () => {
    // Test sync status updates
  });
});
```

### Integration Tests
```typescript
describe('Opera Integration', () => {
  it('should sync package data successfully', () => {
    // Test full sync flow
  });

  it('should resolve conflicts properly', () => {
    // Test conflict resolution
  });
});
```

## 📚 Usage Examples

### Basic Implementation
```typescript
import {
  PackagePerformanceDashboard,
  PackageComparisonTool,
  OperaSyncComponents,
  PackageRevenueAnalytics
} from '@/components/opera';

// In your page component
function OperaDashboard() {
  return (
    <div className="space-y-6">
      <OperaSyncComponents autoSync={true} />

      <PackagePerformanceDashboard
        selectedPackageId={1}
        dateRange={{ start: '2024-01-01', end: '2024-12-31' }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PackageComparisonTool initialPackageIds={[1, 2]} />
        <PackageRevenueAnalytics packageId={1} />
      </div>
    </div>
  );
}
```

---

## 🎯 Key Benefits

1. **Comprehensive Package Analysis**: Paket performansının tam analizi
2. **Side-by-Side Comparison**: Paketlər arası detallı müqayisə
3. **Revenue Optimization**: Gəlir və rentabellik analizi
4. **Real-Time Insights**: Live məlumatlar və real-time analitikalar
5. **Mobile Responsive**: Bütün cihazlarda optimal performans
6. **Extensible Architecture**: Yeni xüsusiyyətlər üçün asan genişləndirmə

Bu komponentlər sizin Opera PMS inteqrasiyanızı professional səviyyəyə çatdıracaq! 🚀
