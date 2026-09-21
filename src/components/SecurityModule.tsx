import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Smartphone, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Users, 
  Building2, 
  Trash2, 
  Activity, 
  ExternalLink, 
  Database, 
  RefreshCw,
  LogOut,
  Clock,
  Laptop,
  CheckCircle,
  Shield,
  Fingerprint,
  Info
} from 'lucide-react';
import { BusinessProfile, Document } from '../types';

// Role type definitions
export type UserRole = 'Entrepreneur' | 'Staff' | 'Compliance Manager' | 'Support' | 'Admin';

export interface UserAccount {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  role: UserRole;
  mfaEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  details: string;
  role: string;
  user: string;
}

interface SecurityModuleProps {
  user: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
  activeBusinessId: string;
  onSwitchBusiness: (businessId: string) => void;
  onUpdateUser: (updated: UserAccount) => void;
  documents: Document[];
  auditLogs: AuditLogEntry[];
  onAddAuditLog: (action: string, details: string) => void;
  onTriggerMfaChallenge: (actionLabel: string, onSuccess: () => void) => void;
}

// 24. Demo Mode default configurations
export const DEMO_CREDENTIALS = {
  email: 'demo@solvex.example',
  password: 'Demo@12345',
  otp: '123456'
};

export default function SecurityModule({
  user,
  onLogin,
  onLogout,
  activeBusinessId,
  onSwitchBusiness,
  onUpdateUser,
  documents,
  auditLogs,
  onAddAuditLog,
  onTriggerMfaChallenge
}: SecurityModuleProps) {

  // Flow State
  const [authView, setAuthView] = useState<'signin' | 'signup' | 'forgot' | 'otp_verify' | 'recovery'>('signin');
  
  // Login Forms Local State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [regAgreeFacilitation, setRegAgreeFacilitation] = useState(false);
  const [regError, setRegError] = useState('');

  // Password reset State
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // OTP State
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [tempUserToAuth, setTempUserToAuth] = useState<UserAccount | null>(null);

  // Recovery State
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Profile Tab state inside Security tab
  const [secTab, setSecTab] = useState<'profile' | 'mfa' | 'sessions' | 'audit' | 'privacy'>('profile');

  // Form states for password changes
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  // Deletion Modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  // Active sessions lists
  const [sessions, setSessions] = useState<ActiveSession[]>([
    { id: '1', device: 'Windows Desktop', browser: 'Google Chrome', location: 'Delhi, IN', lastActive: 'Active Now', isCurrent: true },
    { id: '2', device: 'Apple iPhone 15', browser: 'Safari Mobile', location: 'Delhi, IN', lastActive: '2 hours ago', isCurrent: false },
    { id: '3', device: 'Linux Workstation', browser: 'Mozilla Firefox', location: 'Mumbai, IN', lastActive: 'Sep 18, 2026', isCurrent: false }
  ]);

  // Handle SignIn validation
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Your sign-in details could not be verified. Please check your credentials and try again.');
      return;
    }

    // Demo user check
    if (loginEmail === DEMO_CREDENTIALS.email && loginPassword === DEMO_CREDENTIALS.password) {
      const authenticatedUser: UserAccount = {
        name: 'Arjun Sharma',
        email: DEMO_CREDENTIALS.email,
        phone: '+91 98765 43210',
        companyName: 'SolX Garments',
        role: 'Entrepreneur',
        mfaEnabled: true,
        emailVerified: true,
        phoneVerified: true
      };

      // Redirect through OTP verification
      setTempUserToAuth(authenticatedUser);
      setAuthView('otp_verify');
      setOtpValue('');
    } else {
      // General mock creation for alternative emails (to allow testing)
      if (loginPassword.length >= 6) {
        const customUser: UserAccount = {
          name: loginEmail.split('@')[0],
          email: loginEmail,
          phone: '+91 90000 12345',
          companyName: 'Your Enterprise',
          role: 'Entrepreneur',
          mfaEnabled: false,
          emailVerified: true,
          phoneVerified: true
        };
        onLogin(customUser);
        onAddAuditLog('Login Successful', `User authenticated under ${customUser.email}`);
      } else {
        setLoginError('Your sign-in details could not be verified. Please check your credentials and try again.');
      }
    }
  };

  // Handle SignUp validation
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setRegError('All fields marked as mandatory are required.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    if (!regAgreeTerms || !regAgreeFacilitation) {
      setRegError('Please check and accept the statutory facilitation and privacy policies.');
      return;
    }

    // Success registration
    const newUser: UserAccount = {
      name: regName,
      email: regEmail,
      phone: regPhone,
      companyName: regCompany || 'My Business Entity',
      role: 'Entrepreneur',
      mfaEnabled: false,
      emailVerified: true,
      phoneVerified: true
    };

    onLogin(newUser);
    onAddAuditLog('Account Registration', `Created new account for ${newUser.email}`);
  };

  // OTP Verify
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpValue === DEMO_CREDENTIALS.otp && tempUserToAuth) {
      onLogin(tempUserToAuth);
      onAddAuditLog('Login Successful', `MFA OTP check verified for user ${tempUserToAuth.email}`);
      setTempUserToAuth(null);
    } else {
      setOtpError('Invalid OTP code. Please use the simulated demo code (123456).');
    }
  };

  // Handle Password recovery request
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setRecoverySuccess(true);
  };

  // Handle changing user role
  const handleRoleChange = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    onUpdateUser(updated);
    onAddAuditLog('RBAC Permission Shift', `Switched security context to ${role} perspective`);
  };

  // Changing Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');

    if (!oldPassword.trim() || !newPassword.trim()) {
      setPwdMsg('Please fill in current and new password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdMsg('Passwords do not match.');
      return;
    }

    setPwdMsg('✓ Password successfully updated and hashed at secure REST server.');
    onAddAuditLog('Credentials Update', 'User modified and updated core account password');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Delete Account
  const handleDeleteAccountConfirm = () => {
    setShowDeleteConfirm(false);
    onLogout();
    alert("SolveX Mock Environment: Account deletion initiated securely in accordance with data retention requirements.");
  };

  // Terminate alternate devices sessions
  const handleTerminateOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    onAddAuditLog('Session Invalidation', 'Terminated all remote authorized browser tokens');
  };

  // 15. Privacy tags mapper
  const getPrivacyLabel = (docName: string) => {
    const nameLower = docName.toLowerCase();
    if (nameLower.includes('pan') || nameLower.includes('aadhaar') || nameLower.includes('passport')) {
      return { label: 'HIGHLY SENSITIVE', desc: 'Identity Document', color: 'bg-red-50 border-red-200 text-red-800' };
    }
    if (nameLower.includes('deed') || nameLower.includes('lease') || nameLower.includes('rent')) {
      return { label: 'CONFIDENTIAL', desc: 'Business Agreement', color: 'bg-amber-50 border-amber-200 text-amber-800' };
    }
    if (nameLower.includes('certificate') || nameLower.includes('registration') || nameLower.includes('udyam')) {
      return { label: 'SENSITIVE', desc: 'Business Registration', color: 'bg-blue-50 border-blue-200 text-blue-800' };
    }
    return { label: 'GENERAL', desc: 'Public Business Information', color: 'bg-slate-50 border-slate-200 text-slate-800' };
  };

  // Return unauthenticated view templates
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6 animate-fadeIn">
        
        {/* Branding header in Auth views */}
        <div className="text-center space-y-2 border-b pb-4">
          <div className="inline-flex bg-blue-600 text-white font-extrabold text-sm p-2 rounded tracking-widest uppercase mb-1 shadow-xs">
            SX SECURE
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
            SolveX Secure Portal Access
          </h2>
          <p className="text-xs text-slate-400">
            Intelligent Business Approval & Compliance
          </p>
        </div>

        {/* 24. Demo Mode Helper box */}
        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-xs text-slate-700 leading-normal space-y-1">
          <span className="font-bold text-blue-900 block flex items-center">
            <Shield className="h-3.5 w-3.5 mr-1 text-blue-600 shrink-0" />
            Sandbox Developer Mode
          </span>
          <p className="text-[11px] text-slate-600 font-sans">
            Use the following mock credentials to explore full security checks, RBAC restrictions, and audit logs.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mt-1 bg-white p-2 rounded border border-blue-50">
            <div>Email: <span className="font-bold">{DEMO_CREDENTIALS.email}</span></div>
            <div>Pass: <span className="font-bold">{DEMO_CREDENTIALS.password}</span></div>
            <div className="col-span-2 text-center pt-1 border-t text-blue-800">
              MFA OTP Code: <span className="font-bold">{DEMO_CREDENTIALS.otp}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* A. SIGN IN WORKSPACE */}
        {/* ========================================================= */}
        {authView === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Email or Mobile Number</label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="demo@solvex.example"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthView('forgot')}
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center space-x-2 py-1">
              <input
                id="remember"
                type="checkbox"
                checked={loginRemember}
                onChange={(e) => setLoginRemember(e.target.checked)}
                className="h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-blue-500 rounded"
              />
              <label htmlFor="remember" className="text-[11px] text-slate-500">
                Remember this device (30 days login token)
              </label>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 text-red-900 border border-red-100 rounded text-[11px] leading-relaxed">
                {loginError}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded transition shadow-xs"
              >
                Sign In Securely
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginEmail(DEMO_CREDENTIALS.email);
                  setLoginPassword(DEMO_CREDENTIALS.password);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded transition"
              >
                Auto-fill Sandbox Credentials
              </button>
            </div>

            <div className="text-center pt-2 text-[11px] text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthView('signup')}
                className="text-blue-600 hover:underline font-semibold"
              >
                Create an Account
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* B. SIGN UP / REGISTRATION */}
        {/* ========================================================= */}
        {authView === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">STEP 1 OF 3</span>
              <h3 className="font-bold text-slate-950 text-sm">Create your SolveX Account</h3>
              <p className="text-[10px] text-slate-400">Create a secure account to manage your business approvals and documents.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Full Name *</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Email Address *</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Mobile Number *</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 99999 88888"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Business Name <span className="text-[10px] text-slate-400">(Optional)</span></label>
              <input
                type="text"
                value={regCompany}
                onChange={(e) => setRegCompany(e.target.value)}
                placeholder="e.g. SolX Garments Unit 2"
                className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Password *</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Confirm Password *</label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Verification Consent Checkboxes */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-start space-x-2">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  checked={regAgreeTerms}
                  onChange={(e) => setRegAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 text-blue-600 rounded border-slate-300"
                />
                <label htmlFor="agreeTerms" className="text-[10px] text-slate-500 leading-tight">
                  I agree to the Terms of Service and Privacy Policy. I permit SolveX to encrypt and cache statutory metadata in sandbox object folders.
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="agreeFacilitation"
                  type="checkbox"
                  checked={regAgreeFacilitation}
                  onChange={(e) => setRegAgreeFacilitation(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 text-blue-600 rounded border-slate-300"
                />
                <label htmlFor="agreeFacilitation" className="text-[10px] text-slate-500 leading-tight">
                  I understand that SolveX is an approval facilitation platform and does not issue government approvals. High security files remain client-side isolated.
                </label>
              </div>
            </div>

            {regError && (
              <div className="p-3 bg-red-50 text-red-900 border border-red-100 rounded text-[11px] leading-relaxed">
                {regError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded transition shadow-xs"
            >
              Create Account
            </button>

            <div className="text-center pt-2 text-[11px] text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthView('signin')}
                className="text-blue-600 hover:underline font-semibold"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* C. FORGOT PASSWORD */}
        {/* ========================================================= */}
        {authView === 'forgot' && (
          <form onSubmit={handleRecoverySubmit} className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-950 text-sm">Forgot Password</h3>
              <p className="text-[10px] text-slate-400">Enter your registered email address to receive a secure time-limited recovery link.</p>
            </div>

            {!recoverySuccess ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Registered Email Address</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="demo@solvex.example"
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded transition"
                >
                  Send Reset Link
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded text-xs leading-relaxed">
                  ✓ A secure password reset link has been dispatched to <strong>{recoveryEmail}</strong>. Please check your inbox and click the authorized URL.
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setAuthView('signin');
                setRecoverySuccess(false);
              }}
              className="w-full py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase rounded transition"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* D. MOCK MFA / OTP CHALLENGE PAGE */}
        {/* ========================================================= */}
        {authView === 'otp_verify' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block">SECURE SECOND FACTOR</span>
              <h3 className="font-bold text-slate-950 text-sm">Enter Verification Code</h3>
              <p className="text-[10px] text-slate-400">We have sent a secure OTP to verify identity on your registered mobile/email.</p>
            </div>

            <div className="p-3 bg-amber-50 text-amber-900 border border-amber-100 rounded text-xs font-mono text-center">
              Demo Code: <strong className="text-sm">123456</strong>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block text-center">6-Digit OTP</label>
              <input
                type="text"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                maxLength={6}
                placeholder="123456"
                className="w-32 mx-auto px-3 py-2 border border-slate-200 rounded text-lg font-bold font-mono tracking-widest text-center bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:border-blue-600 block"
              />
            </div>

            {otpError && (
              <div className="p-3 bg-red-50 text-red-900 border border-red-100 rounded text-[11px] leading-relaxed">
                {otpError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded transition"
            >
              Verify & Complete Access
            </button>

            <button
              type="button"
              onClick={() => setAuthView('signin')}
              className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-[10px] font-bold uppercase block text-center"
            >
              Cancel
            </button>
          </form>
        )}

      </div>
    );
  }

  // =========================================================
  // AUTHENTICATED PROFILE & SECURITY WORKSPACE (TAB LAYOUT)
  // =========================================================
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-8 animate-fadeIn">
      
      {/* 1. Welcoming Context Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profile & Security Control Hub</h1>
            <span className="text-[9px] uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center shrink-0">
              <ShieldCheck className="h-3 w-3 mr-0.5 shrink-0" /> Account Protected
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Welcome back, <strong>{user.name}</strong> • Current Enterprise: <strong>{user.companyName}</strong>
          </p>
        </div>

        {/* Rapid user role-switching simulator for RBAC inspection */}
        <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1 text-xs shrink-0 md:max-w-xs">
          <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">
            Simulate RBAC Identity Permission
          </label>
          <div className="flex flex-wrap gap-1">
            {(['Entrepreneur', 'Staff', 'Compliance Manager', 'Support', 'Admin'] as UserRole[]).map(r => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                  user.role === r 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Internal Security Tab Nav */}
      <div className="flex overflow-x-auto pb-1 border-b gap-4">
        {(['profile', 'mfa', 'sessions', 'audit', 'privacy'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSecTab(tab)}
            className={`pb-2 text-xs uppercase tracking-wider font-bold border-b-2 transition shrink-0 ${
              secTab === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'profile' && 'Personal & Role Permissions'}
            {tab === 'mfa' && 'MFA & Credentials'}
            {tab === 'sessions' && 'Active Session Locker'}
            {tab === 'audit' && 'System Audit Trail'}
            {tab === 'privacy' && 'Privacy & Consent Center'}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* SECURITY CONTROLS COMPONENT RENDERING ROUTING */}
      {/* ========================================================= */}
      
      {/* VIEW A. PERSONAL INFO, BUSINESS SEPARATION & RBAC DETAILS */}
      {secTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Columns (Fields) */}
          <div className="lg:col-span-2 space-y-6 text-xs">
            
            {/* Identity Block */}
            <div className="bg-slate-50/50 border rounded-md p-4 space-y-4">
              <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b pb-1">
                Account Demographics & Registry
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">Authorized Full Name:</span>
                  <span className="font-semibold text-slate-800 text-sm block">{user.name}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">Primary Email:</span>
                  <span className="font-semibold text-slate-800 block">{user.email}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">Primary Mobile contact:</span>
                  <span className="font-semibold text-slate-800 block">{user.phone}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">Active Primary Corporate Entity:</span>
                  <span className="font-semibold text-slate-800 block">{user.companyName}</span>
                </div>
              </div>
            </div>

            {/* Business Separation: Switch Business profile */}
            <div className="bg-white border rounded-md p-4 space-y-4 shadow-2xs">
              <div className="border-b pb-1">
                <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                  26. Multi-Business Separation Selector
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Documents, applications, and roadmaps are strictly sandboxed under the active Business ID to prevent accidental data leaks.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'mfg-garments-01', name: 'SolX Garments', sector: 'Textiles & Garments', label: 'GARMENTS-01' },
                  { id: 'mfg-wood-02', name: 'SolX Furniture', sector: 'Furniture & Wood Products', label: 'WOOD-02' },
                  { id: 'mfg-automotive-03', name: 'SolX Automotives', sector: 'Automobiles & EV Assembly', label: 'AUTO-03' }
                ].map(biz => {
                  const isCurrent = activeBusinessId === biz.id;
                  return (
                    <div
                      key={biz.id}
                      onClick={() => {
                        onSwitchBusiness(biz.id);
                        onAddAuditLog('Business Unit Change', `Switched workspace sandbox context to ${biz.name} (${biz.id})`);
                      }}
                      className={`p-3 border rounded-md cursor-pointer transition flex flex-col justify-between ${
                        isCurrent 
                          ? 'bg-blue-50/10 border-blue-600 ring-1 ring-blue-100 shadow-2xs' 
                          : 'bg-slate-50/30 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[8px] font-extrabold tracking-widest text-slate-400 block uppercase">
                          ID: {biz.label}
                        </span>
                        <strong className="text-slate-800 text-xs block">{biz.name}</strong>
                        <span className="text-[10px] text-slate-500 block leading-tight font-sans">{biz.sector}</span>
                      </div>
                      
                      {isCurrent ? (
                        <span className="text-[9px] font-bold text-blue-600 uppercase block mt-3">
                          ✓ Selected Workspace
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 hover:text-slate-600 uppercase block mt-3">
                          Select Sandbox
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Role Based Permissions Card */}
          <div className="space-y-6 text-xs">
            <div className="bg-slate-50 border rounded-lg p-4 space-y-4">
              <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider flex items-center">
                <Users className="h-4 w-4 mr-1.5 text-blue-600 shrink-0" />
                8. Active Role privileges
              </h4>

              <div className="space-y-3 leading-relaxed">
                <div className="p-2.5 bg-white border rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none">Security context:</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1">{user.role}</span>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">Access privileges checklist:</span>
                  <div className="space-y-1.5 font-sans text-slate-600">
                    <div className="flex items-center space-x-2">
                      <span className={user.role !== 'Staff' && user.role !== 'Support' ? 'text-emerald-600 font-bold' : 'text-slate-300 font-bold'}>✓</span>
                      <span className={user.role !== 'Staff' && user.role !== 'Support' ? 'text-slate-700' : 'text-slate-400 line-through'}>View high-sensitivity Identity files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={user.role === 'Entrepreneur' || user.role === 'Admin' ? 'text-emerald-600 font-bold' : 'text-slate-300 font-bold'}>✓</span>
                      <span className={user.role === 'Entrepreneur' || user.role === 'Admin' ? 'text-slate-700' : 'text-slate-400 line-through'}>Delete sensitive files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Manage compliance applications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={user.role === 'Admin' ? 'text-emerald-600 font-bold' : 'text-slate-300 font-bold'}>✓</span>
                      <span className={user.role === 'Admin' ? 'text-slate-700' : 'text-slate-400 line-through'}>Full Admin Configuration panel</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-blue-50 text-blue-900 rounded text-[10px] leading-relaxed font-sans">
                  <strong>Sandbox Role Switching:</strong> Changing your role in the top-right updates permissions immediately across the documents locker to see error limits.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW B. PASSWORD AND MFA CREDENTIALS */}
      {secTab === 'mfa' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
          
          {/* Change Password form */}
          <form onSubmit={handleChangePassword} className="space-y-4 bg-white border rounded-md p-5 shadow-2xs">
            <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b pb-1">
              Change Account Password
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-600"
              />
              {newPassword && (
                <div className="flex items-center space-x-1.5 pt-1 text-[10px]">
                  <span>Strength:</span>
                  <span className={`font-bold uppercase ${
                    newPassword.length < 8 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {newPassword.length < 8 ? 'Weak Strength Indicator' : 'Strong Password Hash'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            {pwdMsg && (
              <div className="p-2 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded text-[11px]">
                {pwdMsg}
              </div>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase rounded transition"
            >
              Update Hashed Password
            </button>
          </form>

          {/* MFA Management box */}
          <div className="space-y-5 bg-slate-50 border rounded-md p-5">
            <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b pb-1">
              Two-Factor Authentication (MFA)
            </h3>

            <div className="space-y-3 leading-relaxed">
              <p className="text-slate-500">
                Enhance sensitive document locker interactions. When enabled, downloading identity cards or replacing tax certifications will require entering an authorized 6-digit OTP code to guarantee audit accountability.
              </p>

              <div className="p-3 bg-white border rounded flex items-center justify-between">
                <div>
                  <strong className="text-xs text-slate-800 block">OTP Verification (SMS/Email)</strong>
                  <span className="text-[10px] text-slate-400 block">Enabled on mobile ending in *210</span>
                </div>
                
                <button
                  onClick={() => {
                    const toggled = !user.mfaEnabled;
                    onUpdateUser({ ...user, mfaEnabled: toggled });
                    onAddAuditLog('MFA Toggle State', `Two-Factor verification status set to ${toggled}`);
                  }}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition ${
                    user.mfaEnabled 
                      ? 'bg-red-100 hover:bg-red-200 text-red-800' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {user.mfaEnabled ? 'Disable MFA Factor' : 'Enable MFA Factor'}
                </button>
              </div>

              {/* Account Recovery option */}
              <div className="p-3 bg-white border rounded space-y-3">
                <span className="font-bold text-slate-800 text-xs block">MFA Emergency Bypass recovery</span>
                <p className="text-[10px] text-slate-400">Generate temporary single-use backup sheets in case of device failure.</p>
                <button
                  onClick={() => alert("SolveX Sandbox Security: Encrypted recovery sheet downloaded containing 8 emergency bypass tokens.")}
                  className="px-3 py-1 border text-slate-700 hover:bg-slate-50 text-[10px] font-bold uppercase rounded transition"
                >
                  Download Recovery Sheet
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW C. ACTIVE AUTHORIZED SESSIONS LOCKER */}
      {secTab === 'sessions' && (
        <div className="space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-2">
            <div>
              <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                13. Session Security & Device Tokens
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Audit log of other browser connections permitted to decrypt sandbox keys.</p>
            </div>

            <button
              onClick={handleTerminateOtherSessions}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded transition"
            >
              Sign Out All Other Devices
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="py-2.5">Device / Platform</th>
                  <th className="py-2.5">Browser Client</th>
                  <th className="py-2.5">IP Location</th>
                  <th className="py-2.5">Last Active Timeline</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-3 flex items-center space-x-2">
                      <Laptop className="h-4 w-4 text-slate-400" />
                      <div>
                        <span className="font-bold text-slate-800">{s.device}</span>
                        {s.isCurrent && (
                          <span className="ml-1.5 text-[8px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded uppercase">
                            This Session
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 font-sans">{s.browser}</td>
                    <td className="py-3 font-mono text-[11px]">{s.location}</td>
                    <td className="py-3 font-sans">{s.lastActive}</td>
                    <td className="py-3 text-right">
                      {s.isCurrent ? (
                        <button onClick={onLogout} className="text-red-600 hover:underline text-[10px] font-bold uppercase">
                          Sign Out
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSessions(prev => prev.filter(x => x.id !== s.id));
                            onAddAuditLog('Session Invalidation', `Invalidated connection token id: ${s.id} (${s.device})`);
                          }}
                          className="text-slate-400 hover:text-red-600 text-[10px] font-bold uppercase"
                        >
                          Revoke Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border rounded text-slate-400 font-sans leading-relaxed">
            <strong>Device Authorization Warning:</strong> SolveX caches authorized session fingerprint tokens inside short-lived secure browser headers. If you detect unrecognized login attempts, invalidate tokens immediately.
          </div>
        </div>
      )}

      {/* VIEW D. SYSTEM AUDIT TRAIL LOGS */}
      {secTab === 'audit' && (
        <div className="space-y-4 text-xs font-sans">
          <div className="border-b pb-2 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-[#0b1b3d] uppercase text-[10px] tracking-wider">
                20. Complete System Security Audit Trail
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Chronological record of sensitive document calls, authentication triggers, and metadata mutations.</p>
            </div>
            
            <button
              onClick={() => alert("Audit log report successfully exported as authorized PDF.")}
              className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border text-slate-700 text-[10px] font-bold uppercase rounded transition"
            >
              Export Audit Trail
            </button>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {auditLogs.map((entry, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border rounded-md flex justify-between items-start gap-4">
                <div className="space-y-1 leading-normal">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{entry.action}</span>
                    <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-bold uppercase font-mono">
                      {entry.role}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] font-sans">{entry.details}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-slate-400 font-mono text-[10px] block">{entry.timestamp}</span>
                  <span className="text-slate-400 block text-[9px] font-sans">By: {entry.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW E. PRIVACY AND CONSENT DATA CENTER */}
      {secTab === 'privacy' && (
        <div className="space-y-6 text-xs leading-relaxed max-w-3xl font-sans">
          <div className="border-b pb-2">
            <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
              22. Privacy & Data Protection Center
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Transparency on which compliance attributes are stored, processed, and locked.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-800 text-sm">What data SolveX stores:</h4>
              <p className="text-slate-500 font-sans">
                We store only basic business profile indicators (power HP, investment scale, worker counts) and document filenames to compute SPCB/DISH clearance matrices. No physical PDF files are stored on public servers.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-800 text-sm">Document Visibility Controls:</h4>
              <p className="text-slate-500 font-sans">
                By default, sensitive documents like Aadhaar, PAN or Lease Deeds are set to **"Only Me" (unshared/isolated)**. Access is granted to "Compliance Teams" or "SolveX Workflow facilitators" only upon explicit owner authentication.
              </p>
            </div>
          </div>

          {/* Account deletion destructive action */}
          <div className="p-4 bg-red-50/50 border border-red-100 rounded-lg space-y-3">
            <span className="font-bold text-red-950 text-xs block uppercase tracking-wider">Destructive Actions Zone</span>
            <p className="text-red-900 text-[11px] leading-relaxed">
              Initiating an account deletion permanently purges registered business profiles, compliance timelines, and file metadata logs. This action cannot be reversed.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded transition"
              >
                Delete Securely My Account
              </button>
            ) : (
              <div className="p-4 bg-white border border-red-200 rounded-md space-y-4 max-w-md">
                <strong className="text-red-900 block font-bold text-xs">Confirm Permanent Deletion</strong>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Please provide a reason for departure:</label>
                  <input
                    type="text"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="e.g. Completed onboarding approvals"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleDeleteAccountConfirm}
                    className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded"
                  >
                    Yes, Delete Securely
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
