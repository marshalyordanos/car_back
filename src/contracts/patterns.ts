export const PATTERNS = {
  AUTH_REGISTER: 'auth.register',
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGIN_ADMIN: 'auth.login.admin',

  AUTH_REFRESH_TOKEN: 'auth.refresh_token',
  AUTH_CHANGE_PASSWORD: 'auth.change_password',
  AUTH_PHONE_VERIFY: 'auth.phone.verify',
  AUTH_PHONE_VERIFY_RESEND: 'auth.phone.verify.resend',
  AUTH_REQUEST_PASSWORD_RESET: 'AUTH_REQUEST_PASSWORD_RESET',
  AUTH_RESET_PASSWORD: 'AUTH_RESET_PASSWORD',
  USER_CREATE: 'user.create',
  USER_FIND_BY_ID: 'user.findById',
  USER_FIND_ALL: 'user.findAll',
  CUSTOMER_FIND_ALL: 'customer.findAll',
  HOST_FIND_ALL: 'host.findAll',
  DASHBOARD_SUMMARY: 'DASHBOARD_SUMMARY',

  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_FIND_BY_EMAIL: 'user.findByEmail',
  USER_CHANGE_ROLE: 'user.changeRole',
  USER_UPDATE_HOST_PROFILE: 'user.updateHostProfile',
  USER_VERIFY_HOST_PROFILE: 'user.verifyHostProfile',
  CREATE_HOST_USER: 'user.host.create',
  ACTIVE_DISACTIVE_USER: 'user.active.disactive',
  USER_FIND_ME_BY_ID: 'user.find.me',
  USER_UPDATE_ME: 'user.update.me',

  PAYOUT_FIND_BY_HOST: 'payout.findByHost', // get payout list for specific host
  PAYOUT_REQUEST_WITHDRAWAL: 'payout.requestWithdrawal', // host requests payout
  PAYOUT_CHECK_STATUS: 'payout.checkStatus', // check payout status (for admin or host)
  PAYOUT_ADMIN_UPDATE_STATUS: 'payout.adminUpdateStatus', // admin approves/rejects payout

  GUEST_ADD_WISHLIST: 'guest.addWishlist',
  GUEST_REMOVE_WISHLIST: 'guest.removeWishlist',
  GUEST_GET_WISHLIST: 'guest.getWishlist',

  STAFF_CREATE: 'staff.register',
  STAFF_DELETE: 'staff.delete',
  STAFF_FIND_ALL: 'staff.findAll',
  STAFF_FIND_BY_ROLE: 'staff.findByRole',
  STAFF_FIND_BY_ID: 'staff.findById',
  STAFF_UPDATE: 'staff.update',
  STAFF_FIND_BY_BRANCH: 'staff.findByBranch',
  STAFF_ASSIGN_BRANCH: 'staff.assignBranch',

  ROLE_CREATE: 'role.create',
  ROLE_FIND_BY_ID_OR_NAME: 'role.findByIdOrName',
  ROLE_FIND_ALL: 'role.findAll',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  ROLE_FIND_BY_ID: 'role.findById',
  ROLE_ASSIGN_PERMISSIONS: 'role.assignPermissions',
  ROLE_REMOVE_PERMISSION: 'role.removePermission',
  ROLE_UPDATE_PERMISSION: 'role.updatePermission',
  ROLE_ASSIGN_USER: 'role.assignUser',

  // ===== PERMISSION =====
  PERMISSION_CREATE: 'permission.create',
  PERMISSION_FIND_BY_ID: 'permission.findById',
  PERMISSION_FIND_ALL: 'permission.findAll',
  PERMISSION_UPDATE: 'permission.update',
  PERMISSION_DELETE: 'permission.delete',

  CAR_MODEL_CREATE: 'carModel.create',
  CAR_MODEL_FIND_BY_ID: 'carModel.findById',
  CAR_MODEL_FIND_ALL: 'carModel.findAll',
  CAR_MODEL_UPDATE: 'carModel.update',
  CAR_MODEL_DELETE: 'carModel.delete',

  CAR_MAKE_CREATE: 'carMake.create',
  CAR_MAKE_FIND_BY_ID: 'carMake.findById',
  CAR_MAKE_FIND_ALL: 'carMake.findAll',
  CAR_MAKE_UPDATE: 'carMake.update',
  CAR_MAKE_DELETE: 'carMake.delete',

  CAR_Type_CREATE: 'carType.create',
  CAR_Type_FIND_BY_ID: 'carType.findById',
  CAR_Type_FIND_ALL: 'carType.findAll',
  CAR_Type_UPDATE: 'carType.update',
  CAR_Type_DELETE: 'carType.delete',

  CAR_CREATE: 'car.create',
  CAR_UPDATE: 'car.update',
  CAR_DELETE: 'car.delete',
  CAR_FIND_BY_ID: 'car.findById',
  CAR_FIND_ALL: 'car.findAll',
  CAR_SEARCH_ADMIN: 'car.search.admin',
  CAR_SEARCH: 'car.search',

  CAR_LIST_BY_HOST: 'car.listByHost',
  CAR_LIST_MAKES: 'car.listMakes',
  CAR_CREATE_MAKE: 'car.createMake',
  CAR_CREATE_MODEL: 'car.createModel',

  CAR_INSURANCE_ADD: 'carInsurance.add',
  CAR_INSURANCE_UPDATE: 'carInsurance.update',
  CAR_INSURANCE_DELETE: 'carInsurance.delete',
  CAR_INSURANCE_GET_BY_CAR: 'carInsurance.getByCar',

  BOOKING_CREATE: 'booking.create',
  BOOKING_UPDATE: 'booking.update',
  BOOKING_DELETE: 'booking.delete',
  BOOKING_GET_BY_ID: 'booking.getById',
  BOOKING_GET_BY_CODE: 'booking.getByCode',

  BOOKING_GET_ALL: 'booking.getAll',
  BOOKING_GET_ALL_MY: 'booking.getAll.my',
  BOOKING_CREATE_GUEST: 'booking.create.guest',
  BOOKING_PAY: 'booking.pay',

  BOOKING_CANCEL_BY_GUEST: 'booking.cancelByGuest',
  BOOKING_CONFIRM_BY_HOST: 'booking.confirmByHost',
  BOOKING_REJECT_BY_HOST: 'booking.rejectByHost',
  BOOKING_CANCEL_BY_HOST: 'booking.cancelByHost',
  BOOKING_COMPLETE_BY_HOST: 'booking.completeByHost',
  BOOKING_CANCEL_BY_ADMIN: 'booking.cancelByAdmin',

  REVIEW_CREATE: 'REVIEW_CREATE',
  REVIEW_GET_BY_ID: 'REVIEW_GET_BY_ID',
  REVIEW_GET_BY_CAR: 'REVIEW_GET_BY_CAR',
  REVIEW_GET_BY_USER: 'REVIEW_GET_BY_USER',
  REVIEW_DELETE: 'REVIEW_DELETE',

  DISPUTE_CREATE: 'DISPUTE_CREATE',
  DISPUTE_GET_BY_ID: 'DISPUTE_GET_BY_ID',
  DISPUTE_GET_All2: 'DISPUTE_GET_All_2',

  DISPUTE_GET_BY_USER: 'DISPUTE_GET_BY_USER',
  DISPUTE_GET_ALL: 'DISPUTE_GET_ALL',
  DISPUTE_RESOLVE: 'DISPUTE_RESOLVE',
  DISPUTE_REJECT: 'DISPUTE_REJECT',
  DISPUTE_CANCEL: 'DISPUTE_CANCEL',
  DISPUTE_ADMIN_REVIEW: 'dispute.adminReview', // e.g., move to UNDER_REVIEW

  PAYMENT_CREATE: 'PAYMENT_CREATE',
  PAYMENT_RELEASE_TO_HOST: 'PAYMENT_RELEASE_TO_HOST',
  PAYMENT_REFUND: 'PAYMENT_REFUND',
  PAYMENT_GET_BY_ID: 'PAYMENT_GET_BY_ID',
  PAYMENT_GET_BY_BOOKING: 'PAYMENT_GET_BY_BOOKING',
  PAYMENT_GET_BY_USER: 'PAYMENT_GET_BY_USER',
  PAYMENT_GET_ALL: 'PAYMENT_GET_ALL',
  PAYMENT_COMPLETE: 'PAYMNET_COMPLETE',

  BOOKING_INSPECTION_CREATE: 'bookingInspection.create',
  BOOKING_INSPECTION_FIND_BY_ID: 'bookingInspection.findById',
  BOOKING_INSPECTION_FIND_ALL: 'bookingInspection.findAll',
  BOOKING_INSPECTION_APPROVE: 'bookingInspection.approve',
  BOOKING_INSPECTION_UPDATE: 'bookingInspection.updated',

  CANCELLATION_POLICY_CREATE: 'cancellationPolicy.create',
  CANCELLATION_POLICY_FIND_ALL: 'cancellationPolicy.findAll',
  CANCELLATION_POLICY_FIND_BY_ID: 'cancellationPolicy.findById',
  CANCELLATION_POLICY_UPDATE: 'cancellationPolicy.update',
  CANCELLATION_POLICY_DELETE: 'cancellationPolicy.delete',
  CANCELLATION_POLICY_SEED: 'cancellationPolicy.seed',

  MESSAGE_SEND: 'message.send',
  MESSAGE_FIND_BY_BOOKING: 'message.findByBooking',
  MESSAGE_LIST_CHAT_FOR_USER: 'message.listChatForUser',
  MESSAGE_MARK_AS_READ: 'message.markAsRead',
  MESSAGE_UNREAD_COUNT: 'message.unreadCount',
  MESSAGE_FIND_BY_ID: 'message.findById',
  MESSAGE_NEW_EVENT: 'message.new', // emitted event for PUSH

  CHAPA_CALL_BACK: 'chapa.call.back',
} as const;
