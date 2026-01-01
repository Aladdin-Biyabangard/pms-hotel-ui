import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {AuthProvider} from "@/context/AuthContext";
import {ProtectedRoute} from "@/components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import CreateHotel from "./pages/hotel/CreateHotel";
import Hotels from "./pages/hotel/Hotels";
import HotelDetails from "./pages/hotel/HotelDetails";
import EditHotel from "./pages/hotel/EditHotel";
import StaffManagement from "./pages/staff/StaffManagement";
import EmployeeManagement from "./pages/staff/EmployeeManagement";
import Rooms from "./pages/hotel/Rooms";
import CreateRoom from "./pages/hotel/CreateRoom";
import EditRoom from "./pages/hotel/EditRoom";
import RoomDetails from "./pages/hotel/RoomDetails";
import Guests from "./pages/guest/Guests";
import CreateGuest from "./pages/guest/CreateGuest";
import EditGuest from "./pages/guest/EditGuest";
import GuestDetailsPage from "./pages/guest/GuestDetails";
import HotelServices from "./pages/hotel/HotelServices";
import CalendarPage from "./pages/opera/CalendarPage";
import WorkflowPage from "./pages/opera/WorkflowPage";
import RevenuePage from "./pages/opera/RevenuePage";
import HousekeepingPage from "./pages/opera/HousekeepingPage";
import RateManagementPage from "./pages/opera/RateManagementPage";
import RatePlans from "./pages/ratePlan/RatePlans";
import CreateRatePlan from "./pages/ratePlan/CreateRatePlan";
import EditRatePlan from "./pages/ratePlan/EditRatePlan";
import RatePlanDetails from "./pages/ratePlan/RatePlanDetails";
import AssignRoomTypes from "./pages/ratePlan/AssignRoomTypes";
import RateManagement from "./pages/ratePlan/RateManagement";
import RoomTypeDetails from "./pages/roomType/RoomTypeDetails";
import RoomTypes from "./pages/roomType/RoomTypes";
import CreateRoomType from "./pages/roomType/CreateRoomType";
import EditRoomType from "./pages/roomType/EditRoomType";
import GroupManagementPage from "./pages/opera/GroupManagementPage";
// Rate Management Pages
import RateCalendar from "./pages/rate/RateCalendar";
import RateTiers from "./modules/rateTiers/pages/RateTiers";
import CreateRateTier from "./modules/rateTiers/pages/CreateRateTier";
import EditRateTier from "./modules/rateTiers/pages/EditRateTier";
import PackageComponents from "./pages/rate_package/PackageComponents.tsx";
import CreatePackageComponent from "./modules/package/pages/CreatePackageComponent";
import EditPackageComponent from "./modules/package/pages/EditPackageComponent";
import { RateClassification, CreateRateType, CreateRateCategory, CreateRateClass, EditRateType, EditRateCategory, EditRateClass } from "./modules/rate/Classification";
import {CreateRateOverride, EditRateOverride, RateOverrides} from "./modules/rate/RateOverride";
import BulkRateUpdate from "./pages/rate/BulkRateUpdate";
import RateMatrix from "./pages/rate/RateMatrix";
import AddDailyRate from "./pages/rate/AddDailyRate";
import BillingPage from "./pages/opera/BillingPage";
import ReportingPage from "./pages/opera/ReportingPage";
import ChannelManagementPage from "./pages/opera/ChannelManagementPage";
import MaintenancePage from "./pages/opera/MaintenancePage";
import PackagePerformancePage from "./pages/opera/PackagePerformancePage";
import PackageComparisonPage from "./pages/opera/PackageComparisonPage";
import PackageRevenuePage from "./pages/opera/PackageRevenuePage";
import PricingRules from "./pages/hotel/PricingRules";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Private Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotels/new"
              element={
                <ProtectedRoute>
                  <CreateHotel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotels"
              element={
                <ProtectedRoute>
                  <Hotels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotels/:id"
              element={
                <ProtectedRoute>
                  <HotelDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotels/:id/edit"
              element={
                <ProtectedRoute>
                  <EditHotel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <StaffManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <EmployeeManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <Rooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/new"
              element={
                <ProtectedRoute>
                  <CreateRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/:id"
              element={
                <ProtectedRoute>
                  <RoomDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guests"
              element={
                <ProtectedRoute>
                  <Guests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guests/new"
              element={
                <ProtectedRoute>
                  <CreateGuest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guests/:id/edit"
              element={
                <ProtectedRoute>
                  <EditGuest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guests/:id"
              element={
                <ProtectedRoute>
                  <GuestDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <HotelServices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflow"
              element={
                <ProtectedRoute>
                  <WorkflowPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/revenue"
              element={
                <ProtectedRoute>
                  <RevenuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/housekeeping"
              element={
                <ProtectedRoute>
                  <HousekeepingPage />
                </ProtectedRoute>
              }
            />
            {/* Opera Package Analysis Routes */}
            <Route
              path="/package-performance"
              element={
                <ProtectedRoute>
                  <PackagePerformancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/package-comparison"
              element={
                <ProtectedRoute>
                  <PackageComparisonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/package-revenue"
              element={
                <ProtectedRoute>
                  <PackageRevenuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rates"
              element={
                <ProtectedRoute>
                  <RateManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-management"
              element={
                <ProtectedRoute>
                  <RateManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-plans"
              element={
                <ProtectedRoute>
                  <RatePlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-plans/new"
              element={
                <ProtectedRoute>
                  <CreateRatePlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-plans/:id"
              element={
                <ProtectedRoute>
                  <RatePlanDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-plans/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRatePlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-plans/:id/assign-room-types"
              element={
                <ProtectedRoute>
                  <AssignRoomTypes />
                </ProtectedRoute>
              }
            />
            {/* Rate Calendar */}
            <Route
              path="/rate-calendar"
              element={
                <ProtectedRoute>
                  <RateCalendar />
                </ProtectedRoute>
              }
            />
            {/* Rate Tiers */}
            <Route
              path="/rate-tiers"
              element={
                <ProtectedRoute>
                  <RateTiers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-tiers/new"
              element={
                <ProtectedRoute>
                  <CreateRateTier />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-tiers/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRateTier />
                </ProtectedRoute>
              }
            />
            {/* Package Components */}
            <Route
              path="/rate-package-components"
              element={
                <ProtectedRoute>
                  <PackageComponents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-package-components/new"
              element={
                <ProtectedRoute>
                  <CreatePackageComponent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-package-components/:id/edit"
              element={
                <ProtectedRoute>
                  <EditPackageComponent />
                </ProtectedRoute>
              }
            />
            {/* Rate Classification */}
            <Route
              path="/rate-classification"
              element={
                <ProtectedRoute>
                  <RateClassification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-types/new"
              element={
                <ProtectedRoute>
                  <CreateRateType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-categories/new"
              element={
                <ProtectedRoute>
                  <CreateRateCategory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-classes/new"
              element={
                <ProtectedRoute>
                  <CreateRateClass />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-types/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRateType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-categories/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRateCategory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-classes/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRateClass />
                </ProtectedRoute>
              }
            />
            {/* Pricing Rules */}
            <Route
              path="/pricing-rules"
              element={
                <ProtectedRoute>
                  <PricingRules />
                </ProtectedRoute>
              }
            />
            {/* Rate Overrides */}
            <Route
              path="/rate-overrides"
              element={
                <ProtectedRoute>
                  <RateOverrides />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-overrides/new"
              element={
                <ProtectedRoute>
                  <CreateRateOverride />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate-overrides/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRateOverride />
                </ProtectedRoute>
              }
            />
            {/* Bulk Rate Update */}
            <Route
              path="/bulk-rate-update"
              element={
                <ProtectedRoute>
                  <BulkRateUpdate />
                </ProtectedRoute>
              }
            />
            {/* Rate Matrix */}
            <Route
              path="/rate-matrix"
              element={
                <ProtectedRoute>
                  <RateMatrix />
                </ProtectedRoute>
              }
            />
            {/* Daily Rates */}
            <Route
              path="/daily-rates/new"
              element={
                <ProtectedRoute>
                  <AddDailyRate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room-types"
              element={
                <ProtectedRoute>
                  <RoomTypes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room-types/new"
              element={
                <ProtectedRoute>
                  <CreateRoomType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room-types/:id"
              element={
                <ProtectedRoute>
                  <RoomTypeDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room-types/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRoomType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <GroupManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/channels"
              element={
                <ProtectedRoute>
                  <ChannelManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute>
                  <MaintenancePage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
