import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from './environment';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  TOKEN_TYPE: 'token_type',
  USER_DATA: 'user_data',
  LOGIN_TIMESTAMP: 'login_timestamp',
  USER_NAME: 'user_name',
  USER_MOBILE: 'user_mobile',
};

const SESSION_DURATION_MS = 6 * 30 * 24 * 60 * 60 * 1000;

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    SEND_OTP: '/api/v1/auth/general/send-otp',
    VERIFY_OTP: '/api/v1/auth/general/verify-otp',
    SIGNIN_OTP: '/api/v1/auth/general/signin-otp',
    REGISTER_PANDIT: '/api/v1/pandits/register',
    REGISTER_MANDIR: '/api/v1/mandirs/register',
    GET_EXTRAFIELDS: '/api/v1/extrafields',
    GET_SPECIALITIES_TREE: '/api/v1/specialities/tree',
    GET_PANDITS: '/api/v1/pandits/all',
    GET_PANDIT_REFERENCES: '/api/v1/pandits/references',
    GET_MANDIRS: '/api/v1/mandirs',
  },
  HEADERS: { 'Content-Type': 'application/json' },
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
  MandirId: string; MandirName: string; Address: string;
  Latitude: number | null; Longitude: number | null;
  OpeningTime: string; ClosingTime: string;
  ContactPerson: string; ContactNo: string; EmailId: string;
  PujaCentreName: string; ChadhavaDetails: string;
  HistoryTitle: string; HistoryDescription: string;
  IsVerify: boolean; IsPaid: boolean;
  Gods: string[]; PanditNames: string[];
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

  static async getUserProfile(): Promise<{ name: string; mobile: string }> {
    try {
      const [[, name], [, mobile]] = await AsyncStorage.multiGet([STORAGE_KEYS.USER_NAME, STORAGE_KEYS.USER_MOBILE]);
      return { name: name ?? '', mobile: mobile ?? '' };
    } catch { return { name: '', mobile: '' }; }
  }

  static async getToken(): Promise<string | null> {
    try { return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN); }
    catch (error) { console.error('Error getting token:', error); return null; }
  }

  static async getAuthHeaders() {
    const token = await this.getToken();
    const tokenType = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_TYPE) || 'bearer';
    if (token) return { ...API_CONFIG.HEADERS, 'Authorization': `${tokenType} ${token}` };
    return API_CONFIG.HEADERS;
  }

  static async clearToken() {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.TOKEN_TYPE, STORAGE_KEYS.USER_DATA, STORAGE_KEYS.LOGIN_TIMESTAMP, STORAGE_KEYS.USER_NAME, STORAGE_KEYS.USER_MOBILE]);
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

export class ApiService {
  private static baseUrl = API_CONFIG.BASE_URL;
  static setBaseUrl(url: string) { this.baseUrl = url; }

  static async sendOtp(mobileNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SEND_OTP}`, {
        method: 'POST', headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ mobile_number: mobileNumber, purpose: 'LOGIN_SIGNUP' } as SendOtpRequest),
      });
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
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SIGNIN_OTP}`, {
        method: 'POST', headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ mobile_number: mobileNumber, otp_code: otpCode } as SignInOtpRequest),
      });
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
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.VERIFY_OTP}`, {
        method: 'POST', headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ mobile_number: mobileNumber, otp_code: otpCode, name, ref_code: refCode } as VerifyOtpRequest),
      });
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
      const r = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_EXTRAFIELDS}/${type}`, {
        method: 'GET', headers: API_CONFIG.HEADERS,
      });
      return r.ok ? await r.json() as ExtraField[] : [];
    } catch { return []; }
  }

  // Tree structure for pandit speciality dropdown
  static async getSpecialitiesTree(): Promise<SpecialityTree[]> {
    try {
      const r = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_SPECIALITIES_TREE}`, {
        method: 'GET', headers: API_CONFIG.HEADERS,
      });
      return r.ok ? await r.json() as SpecialityTree[] : [];
    } catch { return []; }
  }

  static async getPanditReferences(): Promise<PanditReference[]> {
    try {
      const r = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_PANDIT_REFERENCES}`, { method: 'GET', headers: API_CONFIG.HEADERS });
      return r.ok ? await r.json() as PanditReference[] : [];
    } catch { return []; }
  }

  static async getPandits(): Promise<Pandit[]> {
    try {
      const r = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_PANDITS}`, { method: 'GET', headers: API_CONFIG.HEADERS });
      if (r.ok) { const d = await r.json() as GetPanditsResponse; return d.data ?? []; }
      return [];
    } catch { return []; }
  }

  static async getMandirs(): Promise<Mandir[]> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const finalHeaders = { ...headers, 'Accept': 'application/json' };
      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_MANDIRS}`;

      console.log('=== GET MANDIRS REQUEST ===');
      console.log('URL:', url);
      console.log('Headers:', JSON.stringify(finalHeaders, null, 2));
      console.log('Token present:', !!headers['Authorization']);
      console.log('curl equivalent:');
      console.log(`curl --location '${url}' \\`);
      Object.entries(finalHeaders).forEach(([k, v]) => { console.log(`  --header '${k}: ${v}' \\`); });
      console.log(`  --data ''`);
      console.log('==========================');

      const response = await fetch(url, { method: 'GET', headers: finalHeaders });
      const data = await response.json();

      console.log('=== GET MANDIRS RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Body:', JSON.stringify(data, null, 2));
      console.log('============================');

      if (response.ok) {
        if (Array.isArray(data)) return data as Mandir[];
        if (data.data) return data.data as Mandir[];
        return [];
      }
      return [];
    } catch (err) { console.error('getMandirs error:', err); return []; }
  }

  static async registerPandit(payload: RegisterPanditRequest): Promise<{ success: boolean; message: string; data?: RegisterPanditSuccessResponse }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.REGISTER_PANDIT}`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const data = await response.json();
      if (response.ok) return { success: true, message: 'Pandit registered successfully!', data: data as RegisterPanditSuccessResponse };
      const err = data as { detail?: string };
      return { success: false, message: err.detail || 'Registration failed. Please try again.' };
    } catch { return { success: false, message: 'Network error. Please check your connection and try again.' }; }
  }

  static async registerMandir(payload: RegisterMandirRequest): Promise<{ success: boolean; message: string; data?: RegisterMandirSuccessResponse }> {
    try {
      const headers = await TokenManager.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.REGISTER_MANDIR}`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const data = await response.json();
      if (response.ok) return { success: true, message: 'Mandir registered successfully!', data: data as RegisterMandirSuccessResponse };
      const err = data as { detail?: string };
      return { success: false, message: err.detail || 'Registration failed. Please try again.' };
    } catch { return { success: false, message: 'Network error. Please check your connection and try again.' }; }
  }
}
