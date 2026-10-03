import React, { useEffect, useRef, useState } from 'react';
import { request } from '../../services/api';

// Optional clientId from Vite env
const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '';

interface GoogleAuthResponse {
  researchflow_id: string;
  name: string;
  email: string;
  access_token: string;
  token_type: string;
}

interface GoogleSignInButtonProps {
  onSuccess: (data: GoogleAuthResponse) => void;
  onError: (errorMessage: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: string;
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isGsiRendered, setIsGsiRendered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleCredentialResponse(response: { credential: string }) {
    if (!response.credential) {
      onError('Google sign-in was cancelled or failed to retrieve credentials.');
      return;
    }

    try {
      setIsProcessing(true);
      const authResult = await request<GoogleAuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: response.credential }),
      });

      onSuccess(authResult);
    } catch (err: unknown) {
      let message = 'Google sign-in failed. Please try again.';
      if (err instanceof Error) {
        const bodyMatch = err.message.match(/^API Error \[\d+\]:\s*(.*)$/s)?.[1];
        if (bodyMatch) {
          try {
            const parsed = JSON.parse(bodyMatch);
            if (parsed.detail) message = parsed.detail;
          } catch {
            message = bodyMatch;
          }
        } else {
          message = err.message;
        }
      }
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    let intervalId: any;
    const initGoogle = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            cancel_on_tap_outside: true,
          });

          buttonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: text,
            shape: 'rectangular',
            logo_alignment: 'left',
            width: '380',
          });
          setIsGsiRendered(true);
          if (intervalId) clearInterval(intervalId);
        } catch {
          // Retry if not yet ready
        }
      }
    };

    initGoogle();
    if (!isGsiRendered) {
      intervalId = setInterval(initGoogle, 300);
      return () => clearInterval(intervalId);
    }
  }, [GOOGLE_CLIENT_ID, text]);

  // If Google Client ID is configured and Google GSI rendered the official button
  if (GOOGLE_CLIENT_ID && isGsiRendered) {
    return (
      <div className="w-full flex justify-center py-1">
        <div ref={buttonRef} className={disabled || isProcessing ? 'opacity-50 pointer-events-none' : ''} />
      </div>
    );
  }

  // Fallback: If GOOGLE_CLIENT_ID is not yet set or Google SDK is initializing
  return (
    <div className="w-full">
      <div ref={buttonRef} className="hidden" />
      <button
        type="button"
        disabled={disabled || isProcessing}
        onClick={() => {
          if (!GOOGLE_CLIENT_ID) {
            onError(
              'Google Client ID is not configured. Please add GOOGLE_CLIENT_ID to your .env file or VITE_GOOGLE_CLIENT_ID in the frontend environment.'
            );
            return;
          }
          if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
          } else {
            onError('Google Identity Services is still loading. Please check your internet connection or refresh the page.');
          }
        }}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{isProcessing ? 'Verifying with Google...' : 'Continue with Google'}</span>
      </button>
    </div>
  );
};
