import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from './environment';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  TOKEN_TYPE: 'token_type',
  USER_DATA: 'user_data',
  LOGIN_TIMESTAMP: 'login_timestamp',
  USER_NAME: 'user_name',
  USER_MOBILE: 'user_mobile',
  USER_ID: 'user_id',
  USER_PROFILE_ID: 'user_profile_id',
};

// Current language — set by LanguageContext on every lang change
let _currentLang = 'en';
export function setApiLang(lang: string) { _currentLang = lang; }

const SESSION_DURATION_MS = 6 * 30 * 24 * 60 * 60 * 1000;

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    SEND_OTP: '/api/v1/auth/general/send-otp',
    VERIFY_OTP: '/api/v1/auth/general/verify-otp',
    SIGNIN_OTP: '/api/v1/auth/general/signin-otp',
    GET_USER: '/api/v1/auth/general/user',  // append /{mobile_number}
    REGISTER_PANDIT: '/api/v1/pandits/register',
    REGISTER_MANDIR: '/api/v1/mandirs/register',
    GET_EXTRAFIELDS: '/api/v1/extrafields',
    GET_SPECIALITIES_TREE: '/api/v1/specialities/tree',
    GET_PANDITS: '/api/v1/pandits/all',
    GET_PANDIT_REFERENCES: '/api/v1/pandits/references',
    GET_MANDIRS: '/api/v1/mandirs',
    GET_SERVICES: '/api/v1/services',
    GET_GENERAL_USERS: '/api/v1/general-users',
    CREATE_BOOKING: '/api/v1/bookings',
    GET_PAYMENT_URL: '/api/v1/bookings',  // append /{bookingId}/payment-url
    GET_PROFILE: '/api/v1/auth/general/profile',
    UPDATE_PROFILE: '/api/v1/auth/general/profile',
    GET_PUJAS: '/api/v1/pujas/all',
    GET_PUJA_DETAIL: '/api/v1/pujas',  // GET /{id}
    GET_PUJA_PROCESSES: '/api/v1/puja-processes/all',
    GET_FAQS: '/api/v1/faqs/all',
    GET_PUJA_PACKAGE_INFO: '/api/v1/puja-package-info/all',
    GET_ACTIVE_BANNERS: '/api/v1/banner/public/active-banners',
    GET_UPCOMING_EVENTS: '/api/v1/events/public/upcoming',
    GET_LIVE_BROADCASTS: '/api/v1/broadcasts/live/public',
    GET_UPCOMING_BROADCASTS: '/api/v1/broadcasts/upcoming/public',
    BROADCAST_ACCESS: '/api/v1/broadcasts',       // POST /{id}/access
    BROADCAST_STREAM_INFO: '/api/v1/broadcasts/live', // GET /{id}/stream-info
    BROADCAST_VERIFY_PAYMENT: '/api/v1/broadcasts/verify-payment',
    INITIATE_PUJA_BOOKING: '/api/v1/puja-bookings/initiate',
    VERIFY_PUJA_PAYMENT: '/api/v1/payments/verify',
  },
  HEADERS: { 'Content-Type': 'application/json' },
  get LANG_HEADERS() {
    return { 'Content-Type': 'application/json', 'Accept-Language': _currentLang };
  },
};

export type SendOtpRequest = { mobile_number: string; purpose: 'LOGIN_SIGNUP' };
export type VerifyOtpRequest = { mobile_number: string; otp_code: string; name: string; ref_code: string | null };
export type SendOtpSuccessResponse = { message: string };
export type VerifyOtpSuccessResponse = { access_token: string; token_type: string; execution_context: string; message: string };
export type SendOtpErrorResponse = { detail: Array<{ type: string; loc: string[]; msg: string; input: string; ctx: { error: object } }> };
export type VerifyOtpErrorResponse = { detail: string };
export type SignInOtpRequest = { mobile_number: string; otp_code: string };
export type SignInOtpSuccessResponse = { access_token: string; token_type: string; message: string };
export type SignInOtpErrorResponse = { detail: string };

export type UserProfile = {
  id: string; user_id: string; name: string;
  mobile_number: string; address: string;
  pin_code: string; email_id: string;
};

export type UserData = { id: string; user_id: string; name: string; mobile_number: string };

export type ExtraField = { id: string; description: string };

export type SubSpeciality = { id: string; name: string };
export type SpecialityTree = { id: string; name: string; subSpecialities: SubSpeciality[] };

export type PanditReference = { id: string; name: string };

export type PanditSpeciality = { ParentCategoryName: string; SubSpecialityName: string };
export type Pandit = {
  PanditId: string; Name: string; ContactNo: string; PinCode: string;
  ExpInYears: string; PanditsUnderCount: number; ReferenceCode: string | null;
  CreateDate: string; IsPaid: boolean; IsVerify: boolean;
  Languages: string[]; Specialities: PanditSpeciality[];
};
export type GetPanditsResponse = { total_count: number; total_pages: number; data: Pandit[] };

export type Mandir = {
  id: string;
  mandir_name: string;
  address: string;
  pincode: string | null;
  contact_person: string;
  contact_no: string;
  email_id: string;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  is_verify: boolean;
  latitude: number | null;
  longitude: number | null;
  puja_centre_name: string | null;
  chadhava_details: string | null;
  mandir_image_url: string | null;
  certificate_url: string | null;
  how_to_reach: string | null;
  best_time_to_visit: string | null;
};

export type GetMandirResponse = { total_count: number; total_pages: number; data: Mandir[] };

export type GeneralUser = { id: string; name: string };

export type Service = {
  id: string;
  name: string;
  price: number;
  category: string;
  is_active: boolean;
  image_url: string | null;
};
export type GetServicesResponse = { total_count: number; total_pages: number; items: Service[] };

export type Event = {
  id: string;
  event_name: string;
  description: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  is_online: boolean;
  is_paid: boolean;
  amount: number | null;
  status: string;
  image_url: string | null;
  mobile_image_url: string | null;
  video_url: string | null;
  create_date: string;
};
export type GetEventsResponse = { success: boolean; total_count: number; data: Event[] };

export type BannerButton = {
  id: string; button_text: string; button_order: number;
  banner_id: string; button_link: string; created_at: string;
};
export type Banner = {
  id: string; title: string; description: string;
  mobile_image: string; desktop_image: string;
  start_date: string; expiry_date: string;
  duration_days: number; is_active: boolean; is_default: boolean;
  created_at: string; updated_at: string;
  buttons: BannerButton[];
};
export type GetBannersResponse = {
  success: boolean; total_count: number; data: Banner[];
};

export type Broadcast = {
  id: string;
  title: string;
  sub_title: string;
  image_url: string | null;
  schedule_start_time: string;
  is_paid_event: boolean;
  event_price: number | null;
};
export type GetBroadcastsResponse = { items: Broadcast[]; total_count: number; page: number; limit: number; total_pages: number };

export type BroadcastAccessResponse = {
  status: 'authorized' | 'unauthorized' | 'subscribed' | string;
  action: 'allow_stream' | 'requires_payment' | string;
  payment_required: boolean;
  initiate_payment_url?: string;
};

export type StreamInfo = {
  agora_channel_name: string;
  agora_token: string;
  agora_app_id: string;
  event_title: string;
  speaker_name: string;
  viewer_count: number;
};

// ── Puja Info ──────────────────────────────────────────────────────────────
export type PujaInfo = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  is_individual_puja: boolean;
  is_group_puja: boolean;
  is_lokpriya_puja: boolean;
  mandir_address: string;
  puja_date: string;
  maas_paksh: string;
  tithi: string;
  is_active: boolean;
  puja_types: string[];
};
export type GetPujasResponse = { total_count: number; total_pages: number; data: PujaInfo[] };

export type PujaPackage = {
  id: string;
  package_title: string;
  person_count: number;
  person_count_description: string;
  desktop_image_url: string;
  mobile_image_url: string;
  price: number;
};
export type PujaDeity   = { id: string; deity_id: string; deity_name: string };
export type PujaDosha   = { id: string; dosha_id: string; dosha_name: string };
export type PujaBenefit = {
  id: string;
  category_id: string;
  category_name: string;
  header: string;
  description: string;
  desktop_image_url: string;
  mobile_image_url: string;
};
export type PujaSlider  = { id: string; serial_no: number; desktop_image: string; mobile_image: string };
export type PujaDetail = PujaInfo & {
  mandir_id: string;
  mandir_image_url: string;
  desktop_image: string;
  mobile_image: string;
  booking_date: string;
  about_header: string;
  about_details: string;
  pooja_description: string;
  create_date: string;
  update_date: string;
  deities: PujaDeity[];
  doshas: PujaDosha[];
  benefits: PujaBenefit[];
  image_sliders: PujaSlider[];
  packages: PujaPackage[];
};
// ────────────────────────────────────────────────────────────────────────────

export type PujaPackageInfo = { Id: string; SerialNo: number; Description: string };
export type GetPujaPackageInfoResponse = { total_count: number; total_pages: number; data: PujaPackageInfo[] };

export type PujaProcess = { Id: string; SerialNo: number; Title: string; Description: string };
export type GetPujaProcessesResponse = { total_count: number; total_pages: number; data: PujaProcess[] };

export type FAQ = { Id: string; Question: string; Answer: string; IsActive: boolean };
export type GetFAQsResponse = { total_count: number; total_pages: number; data: FAQ[] };

export type InitiatePujaBookingRequest = {
  puja_id: string;
  package_id: string;
  amount: number;
  devotee_name: string;
  mobile_number: string;
  gotra: string;
  nakshatra: string;
  rashi: string;
  family_members_details: string;
};

export type InitiatePujaBookingResponse = {
  booking_id: string;
  booking_no: number;
  amount: number;
  razorpay_order_id: string;
  message: string;
};

export type VerifyPujaPaymentRequest = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type VerifyPujaPaymentResponse = {
  status: string;
  message: string;
  transaction_id: string;
};

export type VerifyPaymentRequest = {
  event_id: string;
  payment_collected_for: string;
  utr: string;
};

export type VerifyPaymentResponse = {
  status: string;
  message: string;
  payment_id: string;
};

export type CreateBookingResponse = {
  booking_number: number;
  payment_no: string;
  id: string;
  [key: string]: unknown;
};

export type CreateBookingRequest = {
  user_id: string;
  booking_for_id: string;
  service_id: string;
  user_type: string;
  booking_type: string;
  booking_date: string;
  amount: number;
  payment_status?: string;
  transaction_reference?: string;
  gateway_payment_id?: string;
  gateway_order_id?: string;
  collection_method?: string;
};

export type PaymentUrlResponse = {
  status: string;
  is_already_paid: boolean;
  booking_number: string;
  amount: number;
  payment_qr_link: string;
};

export type RegisterPanditRequest = {
  name: string; contact_no: string; pin_code: string; exp_in_years: string;
  pandits_under_count: number; reference_code: string | null;
  speciality_ids: string[]; language_ids: string[];
  id_proof_url?: string | null; certificate_url?: string | null;
  profile_photo_url?: string | null; mandir_image_url?: string | null;
};
export type RegisterPanditSuccessResponse = { panditid: string; name: string; createdate: string; payment_qr_link: string };

export type RegisterMandirRequest = {
  mandir_name: string; address: string;
  latitude: number; longitude: number;
  opening_time: string; closing_time: string;
  contact_person: string; contact_no: string; email_id: string;
  puja_centre_name: string; chadhava_details: string;
  god_ids: string[]; pandit_names: string[];
  history_title: string; history_description: string;
};
export type RegisterMandirSuccessResponse = { mandirid?: string; mandir_name?: string; message?: string; [key: string]: unknown };

export class TokenManager {
  static async storeToken(accessToken: string, tokenType: string = 'bearer', name?: string, mobile?: string) {
    try {
      const pairs: [string, string][] = [
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.TOKEN_TYPE, tokenType],
        [STORAGE_KEYS.LOGIN_TIMESTAMP, Date.now().toString()],
      ];
      if (name) pairs.push([STORAGE_KEYS.USER_NAME, name]);
      if (mobile) pairs.push([STORAGE_KEYS.USER_MOBILE, mobile]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) { console.error('Error storing token:', error); }
  }

  static async storeUserData(user: UserData) {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_PROFILE_ID, user.id],
        [STORAGE_KEYS.USER_ID, user.user_id],
        [STORAGE_KEYS.USER_NAME, user.name],
        [STORAGE_KEYS.USER_MOBILE, user.mobile_number],
      ]);
    } catch (error) { console.error('Error storing user data:', error); }
  }

  static async getUserProfile(): Promise<{ id: string; user_id: string; name: string; mobile: string }> {
    try {
      const [[, id], [, user_id], [, name], [, mobile]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER_PROFILE_ID,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USER_NAME,
        STORAGE_KEYS.USER_MOBILE,
      ]);
      return { id: id ?? '', user_id: user_id ?? '', name: name ?? '', mobile: mobile ?? '' };
    } catch { return { id: '', user_id: '', name: '', mobile: '' }; }
  }

  static async getToken(): Promise<string | null> {
    try { return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN); }
    catch (error) { console.error('Error getting token:', error); return null; }
  }

  static async getAuthHeaders() {
    const token = await this.getToken();
    const tokenType = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_TYPE) || 'bearer';
    if (token) return { ...API_CONFIG.LANG_HEADERS, 'Authorization': `${tokenType} ${token}` };
    return API_CONFIG.LANG_HEADERS;
  }

  static async clearToken() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.TOKEN_TYPE, STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.LOGIN_TIMESTAMP, STORAGE_KEYS.USER_NAME, STORAGE_KEYS.USER_MOBILE,
        STORAGE_KEYS.USER_ID, STORAGE_KEYS.USER_PROFILE_ID,
      ]);
    } catch (error) { console.error('Error clearing token:', error); }
  }

  static async isLoggedIn(): Promise<boolean> {
    try {
      const [token, timestamp] = await AsyncStorage.multiGet([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.LOGIN_TIMESTAMP]);
      const tokenValue = token[1]; const timestampValue = timestamp[1];
      if (!tokenValue || !timestampValue) return false;
      const elapsed = Date.now() - parseInt(timestampValue, 10);
      if (elapsed > SESSION_DURATION_MS) { await this.clearToken(); return false; }
      return true;
    } catch { return false; }
  }
}

function logCurl(method: string, url: string, headers: Record<string, string>, body?: string) {
  if (!__DEV__) return;
  console.log(`\n=== API REQUEST: ${method} ${url} ===`);
  let curl = `curl -X ${method} '${url}'`;
  Object.entries(headers).forEach(([k, v]) => {
    const safeVal = k.toLowerCase() === 'authorization' ? '[REDACTED]' : v;
    curl += ` \\\n  -H '${k}: ${safeVal}'`;
  });
  if (body) curl += ` \\\n  -d '${body}'`;
  console.log(curl);
  console.log('='.repeat(50));
}

export class ApiService {
  private static baseUrl = API_CONFIG.BASE_URL;
  static setBaseUrl(url: string) { this.baseUrl = url; }

  static async getUser(mobileNumber: string): Promise<{ success: boolean; data?: UserData }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_USER}/${mobileNumber}`;
      logCurl('GET', url, headers as Record<string, string>);
      const response = await fetch(url, { method: 'GET', headers });
      console.log('[getUser] status:', response.status);
      if (response.ok) {
        const data = await response.json() as UserData;
        console.log('[getUser] response:', JSON.stringify(data));
        await TokenManager.storeUserData(data);
        return { success: true, data };
      }
      return { success: false };
    } catch { return { success: false }; }
  }

  static async sendOtp(mobileNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.SEND_OTP}`;
      const body = JSON.stringify({ mobile_number: mobileNumber, purpose: 'LOGIN_SIGNUP' } as SendOtpRequest);
      logCurl('POST', url, API_CONFIG.LANG_HEADERS, body);
      const response = await fetch(url, { method: 'POST', headers: API_CONFIG.LANG_HEADERS, body });
      const data = await response.json();
      if (response.ok) {
        const s = data as SendOtpSuccessResponse;
        return s.message?.toLowerCase().includes('successfully')
          ? { success: true, message: 'OTP sent successfully' }
          : { success: false, message: 'Unexpected response format' };
      }
      const e = data as SendOtpErrorResponse;
      return { success: false, message: e.detail?.[0]?.msg || 'Something went wrong. Please try again.' };
    } catch { return { success: false, message: 'Network error. Please check your connection and try again.' }; }
  }

  static async signInOtp(mobileNumber: string, otpCode: string): Promise<{ success: boolean; message: string; data?: SignInOtpSuccessResponse }> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.SIGNIN_OTP}`;
      const body = JSON.stringify({ mobile_number: mobileNumber, otp_code: otpCode } as SignInOtpRequest);
      logCurl('POST', url, API_CONFIG.LANG_HEADERS, body);
      const response = await fetch(url, { method: 'POST', headers: API_CONFIG.LANG_HEADERS, body });
      const data = await response.json();
      if (response.ok) {
        const s = data as SignInOtpSuccessResponse;
        if (s.access_token) await TokenManager.storeToken(s.access_token, s.token_type, undefined, mobileNumber);
        return { success: true, message: s.message || 'Sign-In successful.', data: s };
      }
      const e = data as SignInOtpErrorResponse;
      return { success: false, message: e.detail || 'Sign-in failed. Please try again.' };
    } catch { return { success: false, message: 'Network error. Please check your connection and try again.' }; }
  }

  static async verifyOtp(mobileNumber: string, otpCode: string, name: string, refCode: string | null = null): Promise<{ success: boolean; message: string; data?: VerifyOtpSuccessResponse }> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.VERIFY_OTP}`;
      const body = JSON.stringify({ mobile_number: mobileNumber, otp_code: otpCode, name, ref_code: refCode } as VerifyOtpRequest);
      logCurl('POST', url, API_CONFIG.LANG_HEADERS, body);
      const response = await fetch(url, { method: 'POST', headers: API_CONFIG.LANG_HEADERS, body });
      const data = await response.json();
      if (response.ok) {
        const s = data as VerifyOtpSuccessResponse;
        if (s.access_token) await TokenManager.storeToken(s.access_token, s.token_type, name, mobileNumber);
        return { success: true, message: s.message || 'Account created and authenticated successfully.', data: s };
      }
      const e = data as VerifyOtpErrorResponse;
      return { success: false, message: e.detail || 'Invalid verification code or session expired.' };
    } catch { return { success: false, message: 'Network error. Please check your connection and try again.' }; }
  }

  // type 2 = Languages, type 3 = Deities (for mandir)
  static async getExtraFields(type: number): Promise<ExtraField[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_EXTRAFIELDS}/${type}`;
      logCurl('GET', url, API_CONFIG.LANG_HEADERS);
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      return r.ok ? await r.json() as ExtraField[] : [];
    } catch { return []; }
  }

  static async getSpecialitiesTree(): Promise<SpecialityTree[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_SPECIALITIES_TREE}`;
      logCurl('GET', url, API_CONFIG.LANG_HEADERS);
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      return r.ok ? await r.json() as SpecialityTree[] : [];
    } catch { return []; }
  }

  static async getPanditReferences(): Promise<PanditReference[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_PANDIT_REFERENCES}`;
      logCurl('GET', url, API_CONFIG.LANG_HEADERS);
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      return r.ok ? await r.json() as PanditReference[] : [];
    } catch { return []; }
  }

  static async getPandits(): Promise<Pandit[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_PANDITS}`;
      logCurl('GET', url, API_CONFIG.LANG_HEADERS);
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      if (r.ok) { const d = await r.json() as GetPanditsResponse; return d.data ?? []; }
      return [];
    } catch { return []; }
  }

  static async getMandirs(): Promise<Mandir[]> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_MANDIRS}`;
      logCurl('GET', url, headers as Record<string, string>);
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) return [];
      const data = await response.json();
      if (Array.isArray(data)) return data as Mandir[];
      if (Array.isArray(data?.data)) return (data as GetMandirResponse).data;
      return [];
    } catch { return []; }
  }

  static async createBooking(payload: CreateBookingRequest): Promise<{ success: boolean; message: string; data?: CreateBookingResponse; status?: number }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.CREATE_BOOKING}`;
      const body = JSON.stringify(payload);
      logCurl('POST', url, headers as Record<string, string>, body);
      const r = await fetch(url, { method: 'POST', headers, body });
      const statusCode = r.status;
      console.log('[createBooking] HTTP status:', statusCode);
      const data = await r.json();
      console.log('[createBooking] full response:', JSON.stringify(data));
      console.log('[createBooking] response keys:', Object.keys(data || {}));
      // 200 or 201 both mean success
      if (r.ok) return { success: true, message: 'Booking created successfully!', data, status: statusCode };
      return { success: false, message: data?.detail || data?.message || `Booking failed (${statusCode}).`, status: statusCode };
    } catch (err: any) {
      console.error('[createBooking] exception:', err?.message);
      return { success: false, message: 'Network error.' };
    }
  }

  static async getPaymentUrl(bookingId: string): Promise<{ success: boolean; data?: PaymentUrlResponse; message: string; status?: number }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_PAYMENT_URL}/${bookingId}/payment-url`;
      logCurl('GET', url, headers as Record<string, string>);
      const r = await fetch(url, { method: 'GET', headers });
      console.log('[getPaymentUrl] status:', r.status);
      const data = await r.json();
      console.log('[getPaymentUrl] response:', JSON.stringify(data));
      if (r.ok) return { success: true, data: data as PaymentUrlResponse, message: '', status: r.status };
      return { success: false, message: data?.detail || 'Failed to get payment URL.', status: r.status };
    } catch { return { success: false, message: 'Network error.' }; }
  }

  static async getGeneralUsers(): Promise<GeneralUser[]> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_GENERAL_USERS}`;
      logCurl('GET', url, headers as Record<string, string>);
      const r = await fetch(url, { method: 'GET', headers });
      return r.ok ? await r.json() as GeneralUser[] : [];
    } catch { return []; }
  }

  static async getBroadcastAccess(eventId: string): Promise<{ success: boolean; data?: BroadcastAccessResponse; status?: number }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.BROADCAST_ACCESS}/${eventId}/access`;
      logCurl('POST', url, headers as Record<string, string>);
      const r = await fetch(url, { method: 'POST', headers });
      const data = await r.json();
      return { success: r.ok || r.status === 402, data: data as BroadcastAccessResponse, status: r.status };
    } catch { return { success: false }; }
  }

  static async getStreamInfo(eventId: string): Promise<{ success: boolean; data?: StreamInfo }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.BROADCAST_STREAM_INFO}/${eventId}/stream-info`;
      logCurl('GET', url, headers as Record<string, string>);
      const r = await fetch(url, { method: 'GET', headers });
      if (r.ok) return { success: true, data: await r.json() as StreamInfo };
      return { success: false };
    } catch { return { success: false }; }
  }

  static async verifyBroadcastPayment(payload: VerifyPaymentRequest): Promise<{ success: boolean; data?: VerifyPaymentResponse; message: string }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.BROADCAST_VERIFY_PAYMENT}`;
      const body = JSON.stringify(payload);
      logCurl('POST', url, headers as Record<string, string>, body);
      const r = await fetch(url, { method: 'POST', headers, body });
      const data = await r.json();
      if (r.ok) return { success: true, data: data as VerifyPaymentResponse, message: data.message ?? '' };
      return { success: false, message: data?.detail || 'Verification failed.' };
    } catch { return { success: false, message: 'Network error.' }; }
  }

  static async getActiveBanners(): Promise<Banner[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_ACTIVE_BANNERS}`;
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      if (r.ok) { const d = await r.json() as GetBannersResponse; return d.data ?? []; }
      return [];
    } catch { return []; }
  }

  static async getUpcomingEvents(): Promise<Event[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_UPCOMING_EVENTS}`;
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      if (r.ok) { const d = await r.json() as GetEventsResponse; return d.data ?? []; }
      return [];
    } catch { return []; }
  }

  static async getLiveBroadcasts(): Promise<Broadcast[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_LIVE_BROADCASTS}`;
      logCurl('GET', url, API_CONFIG.LANG_HEADERS);
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      if (r.ok) { const d = await r.json() as GetBroadcastsResponse; return d.items ?? []; }
      return [];
    } catch { return []; }
  }

  static async getUpcomingBroadcasts(): Promise<Broadcast[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_UPCOMING_BROADCASTS}`;
      logCurl('GET', url, API_CONFIG.LANG_HEADERS);
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      if (r.ok) { const d = await r.json() as GetBroadcastsResponse; return d.items ?? []; }
      return [];
    } catch { return []; }
  }

  static async getServices(): Promise<Service[]> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_SERVICES}`;
      logCurl('GET', url, headers as Record<string, string>);
      const r = await fetch(url, { method: 'GET', headers });
      if (r.ok) { const d = await r.json() as GetServicesResponse; return d.items ?? []; }
      return [];
    } catch { return []; }
  }

  static async getProfile(): Promise<{ success: boolean; data?: UserProfile }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_PROFILE}`;
      const r = await fetch(url, { method: 'GET', headers });
      if (r.ok) return { success: true, data: await r.json() as UserProfile };
      return { success: false };
    } catch { return { success: false }; }
  }

  static async updateProfile(payload: { address: string; email_id: string }): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.UPDATE_PROFILE}`;
      const body = JSON.stringify(payload);
      const r = await fetch(url, { method: 'PATCH', headers, body });
      const data = await r.json();
      if (r.ok) return { success: true, message: data.message ?? 'Profile updated successfully.' };
      return { success: false, message: data.detail || 'Update failed.' };
    } catch { return { success: false, message: 'Network error.' }; }
  }

  static async registerPandit(payload: RegisterPanditRequest): Promise<{ success: boolean; message: string; data?: RegisterPanditSuccessResponse }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.REGISTER_PANDIT}`;
      const body = JSON.stringify(payload);
      logCurl('POST', url, headers as Record<string, string>, body);
      const response = await fetch(url, { method: 'POST', headers, body });
      const data = await response.json();
      if (response.ok) return { success: true, message: 'Pandit registered successfully!', data: data as RegisterPanditSuccessResponse };
      const err = data as { detail?: string };
      return { success: false, message: err.detail || 'Registration failed. Please try again.' };
    } catch { return { success: false, message: 'Network error. Please check your connection and try again.' }; }
  }

  static async submitContact(payload: { Name: string; Email: string; Phone: string; Subject: string; Message: string }): Promise<{ success: boolean; message: string }> {
    try {
      const url = `${this.baseUrl}/api/v1/contact`;
      const body = JSON.stringify(payload);
      const r = await fetch(url, { method: 'POST', headers: API_CONFIG.HEADERS, body });
      const data = await r.json();
      if (r.ok) return { success: true, message: data.message ?? 'Sent successfully.' };
      return { success: false, message: data.detail || data.message || 'Submission failed.' };
    } catch { return { success: false, message: 'Network error. Please try again.' }; }
  }

  static async getPujas(pujaType: 'Individual' | 'Group' | 'Lokpriya'): Promise<PujaInfo[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_PUJAS}?booking_status=open&puja_types=${pujaType}&page=1&limit=100`;
      logCurl('GET', url, API_CONFIG.LANG_HEADERS);
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      if (r.ok) { const d = await r.json() as GetPujasResponse; return d.data ?? []; }
      console.warn('[getPujas] status:', r.status, await r.text().catch(() => ''));
      return [];
    } catch { return []; }
  }

  static async getPujaDetail(id: string): Promise<{ success: boolean; data?: PujaDetail }> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_PUJA_DETAIL}/${id}`;
      logCurl('GET', url, API_CONFIG.LANG_HEADERS);
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      console.log('[getPujaDetail] status:', r.status, 'url:', url);
      if (r.ok) return { success: true, data: await r.json() as PujaDetail };
      const errText = await r.text().catch(() => '');
      console.warn('[getPujaDetail] error body:', errText);
      return { success: false };
    } catch (e) { console.error('[getPujaDetail] exception:', e); return { success: false }; }
  }

  static async registerMandir(payload: RegisterMandirRequest): Promise<{ success: boolean; message: string; data?: RegisterMandirSuccessResponse }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.REGISTER_MANDIR}`;
      const body = JSON.stringify(payload);
      logCurl('POST', url, headers as Record<string, string>, body);
      const response = await fetch(url, { method: 'POST', headers, body });
      const data = await response.json();
      if (response.ok) return { success: true, message: 'Mandir registered successfully!', data: data as RegisterMandirSuccessResponse };
      const err = data as { detail?: string };
      return { success: false, message: err.detail || 'Registration failed. Please try again.' };
    } catch { return { success: false, message: 'Network error. Please check your connection and try again.' }; }
  }

  static async getPujaProcesses(): Promise<PujaProcess[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_PUJA_PROCESSES}?page=1&limit=100`;
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      if (r.ok) { const d = await r.json() as GetPujaProcessesResponse; return d.data ?? []; }
      return [];
    } catch { return []; }
  }

  static async getFaqs(): Promise<FAQ[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_FAQS}?page=1&limit=100`;
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      if (r.ok) { const d = await r.json() as GetFAQsResponse; return d.data ?? []; }
      return [];
    } catch { return []; }
  }

  static async initiatePujaBooking(payload: InitiatePujaBookingRequest): Promise<{ success: boolean; pending?: boolean; data?: InitiatePujaBookingResponse; message: string }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.INITIATE_PUJA_BOOKING}`;
      const body = JSON.stringify(payload);
      logCurl('POST', url, headers as Record<string, string>, body);
      const r = await fetch(url, { method: 'POST', headers, body });
      const data = await r.json();
      if (r.ok) return { success: true, data: data as InitiatePujaBookingResponse, message: data.message ?? '' };
      // 409 = pending booking exists — backend may return the existing order details
      if (r.status === 409 && data?.razorpay_order_id) {
        return { success: true, pending: true, data: data as InitiatePujaBookingResponse, message: data.detail ?? '' };
      }
      return { success: false, message: data?.detail || data?.message || 'Failed to initiate booking.' };
    } catch { return { success: false, message: 'Network error.' }; }
  }

  static async verifyPujaPayment(payload: VerifyPujaPaymentRequest): Promise<{ success: boolean; data?: VerifyPujaPaymentResponse; message: string }> {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.VERIFY_PUJA_PAYMENT}`;
      const body = JSON.stringify(payload);
      logCurl('POST', url, headers, body);
      const r = await fetch(url, { method: 'POST', headers, body });
      const data = await r.json();
      if (r.ok) return { success: true, data: data as VerifyPujaPaymentResponse, message: data.message ?? '' };
      return { success: false, message: data?.detail || data?.message || 'Payment verification failed.' };
    } catch { return { success: false, message: 'Network error.' }; }
  }

  static async getPujaPackageInfo(): Promise<PujaPackageInfo[]> {
    try {
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_PUJA_PACKAGE_INFO}?page=1&limit=100`;
      const r = await fetch(url, { method: 'GET', headers: API_CONFIG.LANG_HEADERS });
      if (r.ok) { const d = await r.json() as GetPujaPackageInfoResponse; return d.data ?? []; }
      return [];
    } catch { return []; }
  }
}
