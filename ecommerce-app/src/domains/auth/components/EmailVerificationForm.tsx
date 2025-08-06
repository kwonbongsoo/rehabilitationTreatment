import { Button } from '@/components/common/Button';
import { FormContainer } from '@/components/common/Form';
import React, { useState, useRef, useEffect, ReactElement } from 'react';

interface EmailVerificationFormProps {
  email: string;
  onSubmit: (verificationCode: string) => Promise<void>;
  isLoading?: boolean;
  onResend?: () => Promise<void>;
}

export function EmailVerificationForm({
  email,
  onSubmit,
  isLoading = false,
  onResend,
}: EmailVerificationFormProps): ReactElement {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus on first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return; // Only allow single character

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent): void => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await onSubmit(verificationCode.join(''));
  };

  const handleResend = async (): Promise<void> => {
    if (onResend) {
      setIsResending(true);
      try {
        await onResend();
      } finally {
        setIsResending(false);
      }
    }
  };

  const isComplete = verificationCode.every((digit) => digit !== '');

  return (
    <FormContainer onSubmit={handleSubmit} className="mobile-auth-form">
      <div className="otp-verification-content">
        <div className="otp-icon">
          <span>📧</span>
        </div>

        <div className="otp-info">
          <h3>Email Verification</h3>
          <p>
            Enter the 6-digit verification code sent to your email address to verify your identity.
          </p>
          <p style={{ fontSize: '14px', fontWeight: '600', margin: '12px 0' }}>
            <strong>{email}</strong>
          </p>
        </div>

        <div className="otp-container">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                if (el) {
                  inputRefs.current[index] = el;
                }
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-input"
              disabled={isLoading}
            />
          ))}
        </div>

        <div className="resend-section">
          <span>Didn&apos;t receive the email? </span>
          <button
            type="button"
            className="resend-link"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? 'Resending...' : 'Resend Email'}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          isLoading={isLoading}
          disabled={!isComplete || isLoading}
          className="auth-submit-button"
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </Button>
      </div>
    </FormContainer>
  );
}
