export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_DELIVERY = 'free_delivery',
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

export enum CouponTrigger {
  FIRST_ORDER = 'first_order',
  ORDER_COUNT = 'order_count',
  PRODUCT_QUANTITY = 'product_quantity',
  MANUAL = 'manual',
}
