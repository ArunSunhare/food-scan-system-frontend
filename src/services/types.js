export const StatsType = {
  total_users: 0,
  today_registrations: 0,
  today_qr_generated: 0,
  active_qrs: 0,
  expired_qrs_today: 0,
  staff_count: 0,
  guest_count: 0,
  date: '',
  timestamp: ''
};

/**
 * @typedef {Object} UserType
 * @property {string} id - User ID
 * @property {string} name - Full name
 * @property {string} type - User type (Guest, Staff, Attendant)
 * @property {string} mobile - Mobile number
 * @property {string} createdAt - Registration date/time
 * @property {string} qrStatus - QR status (Valid, Used, Invalid)
 * @property {string} photo - Profile photo URL
 * @property {string} email - Email address
 * @property {string} [address] - Address (optional for Guests)
 * @property {string} [department] - Department (optional for Staff)
 * @property {string} [patientId] - Patient ID (optional for Attendants)
 */