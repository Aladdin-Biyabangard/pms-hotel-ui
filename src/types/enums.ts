/**
 * EntityStatus enum matching backend EntityStatus
 */
export enum EntityStatus {
    PENDING = 'PENDING',
    DELETED = 'DELETED',
    CREATED = 'CREATED',
    PUBLISHED = 'PUBLISHED',
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

/**
 * Role enum matching backend Role
 */
export enum Role {
    DIRECTOR = 'DIRECTOR',
    ADMIN = 'ADMIN',
    FRONT_DESK = 'FRONT_DESK',
    HOUSEKEEPING = 'HOUSEKEEPING',
    MANAGER = 'MANAGER',
    ACCOUNTING = 'ACCOUNTING',
}

/**
 * RoomStatus enum matching backend RoomStatus
 */
export enum RoomStatus {
    VACANT_CLEAN = 'VACANT_CLEAN',
    VACANT_DIRTY = 'VACANT_DIRTY',
    OCCUPIED_CLEAN = 'OCCUPIED_CLEAN',
    OCCUPIED_DIRTY = 'OCCUPIED_DIRTY',
    OUT_OF_ORDER = 'OUT_OF_ORDER',
    OUT_OF_SERVICE = 'OUT_OF_SERVICE',
    PICKUP = 'PICKUP',
    INSPECTED = 'INSPECTED',
    DUE_OUT = 'DUE_OUT',
    CHECK_OUT = 'CHECK_OUT',
    SLEEP_OUT = 'SLEEP_OUT',
    STAY_OVER = 'STAY_OVER',
    DO_NOT_DISTURB = 'DO_NOT_DISTURB',
    LOCKED_OUT = 'LOCKED_OUT',
    OFF_MARKET = 'OFF_MARKET',
    AS_IS = 'AS_IS',
    EARLY_ARRIVAL = 'EARLY_ARRIVAL',
    LATE_CHECKOUT = 'LATE_CHECKOUT',
    // Legacy aliases for backward compatibility
    AVAILABLE = 'VACANT_CLEAN',
    OCCUPIED = 'OCCUPIED_CLEAN',
}

/**
 * ReservationStatus enum matching backend ReservationStatus
 */
export enum ReservationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    RESERVED = 'RESERVED',
    CHECKED_IN = 'CHECKED_IN',
    CHECKED_OUT = 'CHECKED_OUT',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW',
}

/**
 * PaymentStatus enum matching backend PaymentStatus
 */
export enum PaymentStatus {
    PENDING = 'PENDING',
    DEPOSIT = 'DEPOSIT',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    PAID = 'PAID',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
    CANCELLED = 'CANCELLED',
}

/**
 * PaymentMethod enum matching backend PaymentMethod
 */
export enum PaymentMethod {
    CASH = 'CASH',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    PAYPAL = 'PAYPAL',
    STRIPE = 'STRIPE',
    OTHER = 'OTHER',
}

/**
 * GuestType enum matching backend GuestType
 */
export enum GuestType {
    INDIVIDUAL = 'INDIVIDUAL',
    CORPORATE = 'CORPORATE',
    GROUP = 'GROUP',
    VIP = 'VIP',
    LOYALTY_MEMBER = 'LOYALTY_MEMBER',
}

/**
 * HousekeepingStatus enum matching backend HousekeepingStatus
 */
export enum HousekeepingStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    INSPECTED = 'INSPECTED',
    NEEDS_ATTENTION = 'NEEDS_ATTENTION',
    OUT_OF_ORDER = 'OUT_OF_ORDER',
}

/**
 * ReservationSource enum matching backend ReservationSource
 */
export enum ReservationSource {
    WEBSITE = 'WEBSITE',
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    WALK_IN = 'WALK_IN',
    TRAVEL_AGENT = 'TRAVEL_AGENT',
    ONLINE_TRAVEL_AGENT = 'ONLINE_TRAVEL_AGENT',
    CORPORATE = 'CORPORATE',
    GROUP = 'GROUP',
    LOYALTY_PROGRAM = 'LOYALTY_PROGRAM',
    OTHER = 'OTHER',
}

/**
 * MaintenanceStatus enum matching backend MaintenanceStatus
 */
export enum MaintenanceStatus {
    REQUESTED = 'REQUESTED',
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DEFERRED = 'DEFERRED',
}

/**
 * MaintenancePriority enum matching backend MaintenancePriority
 */
export enum MaintenancePriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
    EMERGENCY = 'EMERGENCY',
}

/**
 * InvoiceStatus enum matching backend InvoiceStatus
 */
export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    SENT = 'SENT',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

/**
 * PricingRuleType enum matching backend PricingRuleType
 */
export enum PricingRuleType {
    SEASONAL = 'SEASONAL',
    WEEKEND = 'WEEKEND',
    WEEKDAY = 'WEEKDAY',
    HOLIDAY = 'HOLIDAY',
    GROUP_DISCOUNT = 'GROUP_DISCOUNT',
    LENGTH_OF_STAY = 'LENGTH_OF_STAY',
    ADVANCE_BOOKING = 'ADVANCE_BOOKING',
    LAST_MINUTE = 'LAST_MINUTE',
    LOYALTY_DISCOUNT = 'LOYALTY_DISCOUNT',
    CORPORATE_RATE = 'CORPORATE_RATE',
    PACKAGE_DEAL = 'PACKAGE_DEAL',
}

/**
 * ReviewStatus enum matching backend ReviewStatus
 */
export enum ReviewStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    FLAGGED = 'FLAGGED',
}

/**
 * RoomType enum matching backend RoomType
 */
export enum RoomType {
    DELUXE = 'DELUXE',
    SUIT = 'SUIT',
    STANDART = 'STANDART',
}

/**
 * ReservationStep enum matching backend ReservationStep
 */
export enum ReservationStep {
    INIT = 'INIT',
    ROOM_SELECTED = 'ROOM_SELECTED',
    GUEST_ASSIGNED = 'GUEST_ASSIGNED',
    SERVICES_SELECTED = 'SERVICES_SELECTED',
    PRICING_CONFIRMED = 'PRICING_CONFIRMED',
    PAYMENT_PENDING = 'PAYMENT_PENDING',
    CONFIRMED = 'CONFIRMED',
}

/**
 * ServiceType enum matching backend ServiceType
 */
export enum ServiceType {
    BREAKFAST = 'BREAKFAST',
    DINNER = 'DINNER',
    LUNCH = 'LUNCH',
    SPA = 'SPA',
    LAUNDRY = 'LAUNDRY',
    PARKING = 'PARKING',
    ROOM_SERVICE = 'ROOM_SERVICE',
    WIFI = 'WIFI',
    GYM = 'GYM',
    POOL = 'POOL',
    CONCIERGE = 'CONCIERGE',
    TRANSPORTATION = 'TRANSPORTATION',
    BUSINESS_CENTER = 'BUSINESS_CENTER',
    PET_SERVICE = 'PET_SERVICE',
    OTHER = 'OTHER',
}

/**
 * CurrencyCode enum matching backend CurrencyCode
 */
export enum CurrencyCode {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
    CNY = 'CNY',
    AUD = 'AUD',
    CAD = 'CAD',
    CHF = 'CHF',
    INR = 'INR',
    AED = 'AED',
    SAR = 'SAR',
    TRY = 'TRY',
    RUB = 'RUB',
    BRL = 'BRL',
    MXN = 'MXN',
    SGD = 'SGD',
    HKD = 'HKD',
    THB = 'THB',
    KRW = 'KRW',
    AZN = 'AZN',
}

/**
 * ChargeType enum matching backend ChargeType
 */
export enum ChargeType {
    ROOM = 'ROOM',
    SERVICE = 'SERVICE',
    TAX = 'TAX',
    DISCOUNT = 'DISCOUNT',
    FEE = 'FEE',
    ADJUSTMENT = 'ADJUSTMENT',
    REFUND = 'REFUND',
}

/**
 * ServiceChargeType enum matching backend ServiceChargeType
 */
export enum ServiceChargeType {
    PER_NIGHT = 'PER_NIGHT',
    PER_PERSON = 'PER_PERSON',
    PER_PERSON_PER_NIGHT = 'PER_PERSON_PER_NIGHT',
    PER_STAY = 'PER_STAY',
    PER_HOUR = 'PER_HOUR',
    PER_DAY = 'PER_DAY',
    FLAT = 'FLAT',
    QUANTITY = 'QUANTITY',
}

/**
 * ReferenceType enum matching backend ReferenceType
 */
export enum ReferenceType {
    ROOM = 'ROOM',
    HOTEL_SERVICE = 'HOTEL_SERVICE',
    MANUAL = 'MANUAL',
    TAX_RULE = 'TAX_RULE',
    DISCOUNT_RULE = 'DISCOUNT_RULE',
    FEE_RULE = 'FEE_RULE',
}

