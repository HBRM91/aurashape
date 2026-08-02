import { useAuthStore } from '@/src/stores/auth';
import { COLORS } from '@/src/constants/theme';
import { Link } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { AuthFrame } from '@/src/web/AuthFrame';
import { WebButton } from '@/src/web/WebButton';
import { WebField } from '@/src/web/WebField';
import { WEB_TOKENS } from '@/src/web/tokens';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email');
      setFieldError('Email is required');
      return;
    }
    setSubmitting(true);
    setError('');
    setFieldError('');
    const result = await resetPassword(email);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <AuthFrame heading="Reset your password" subtitle="We'll send you a reset link">
        {sent ? (
          <View style={styles.success}>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successCopy}>
              If an account exists for {email}, we've sent a password reset link.
            </Text>
            <Link accessibilityRole="link" href="/auth/login" style={styles.centerLink}>Back to Log In</Link>
          </View>
        ) : (
          <View style={styles.webForm}>
            {error ? <Text accessibilityLiveRegion="polite" style={styles.formError}>{error}</Text> : null}
            <WebField
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              error={fieldError}
              onChangeText={(value) => {
                setEmail(value);
                setFieldError('');
              }}
              placeholder="you@example.com"
              textContentType="emailAddress"
              value={email}
            />
            <WebButton
              disabled={submitting}
              label={submitting ? 'Sending...' : 'Send Reset Link'}
              onPress={handleReset}
              style={styles.submitButton}
            />
            <Link accessibilityRole="link" href="/auth/login" style={styles.centerLink}>Back to Log In</Link>
            <Text style={styles.legalCopy}>Your email is only used to send this reset link.</Text>
            <View style={styles.legalLinks}>
              <Link accessibilityRole="link" href="https://aurashape.app/privacy" style={styles.legalLink}>Privacy Policy</Link>
              <Text style={styles.mutedText}>and</Text>
              <Link accessibilityRole="link" href="https://aurashape.app/terms" style={styles.legalLink}>Terms of Service</Link>
            </View>
          </View>
        )}
      </AuthFrame>
    );
  }

  if (sent) {
    return (
      <AuthFrame heading="Reset your password" subtitle="We'll send you a reset link">
        <View className="flex-1 items-center justify-center bg-white px-8">
          <Text className="mb-4 text-center text-2xl font-bold" style={{ color: COLORS.primaryDark }}>
            Check your email
          </Text>
          <Text className="text-center text-gray-500">
            If an account exists for {email}, we've sent a password reset link.
          </Text>
          <Link href="/auth/login" className="mt-8 font-semibold" style={{ color: COLORS.secondary }}>
            Back to Log In
          </Link>
        </View>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame heading="Reset your password" subtitle="We'll send you a reset link">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <View className="flex-1 justify-center px-8">
          <Text className="mb-2 text-center text-3xl font-bold" style={{ color: COLORS.primaryDark }}>
            Reset Password
          </Text>
          <Text className="mb-8 text-center text-gray-500">
            Enter your email to receive a reset link
          </Text>

          {error ? (
            <View className="mb-4 rounded-lg bg-red-50 p-3">
              <Text className="text-center text-red-500">{error}</Text>
            </View>
          ) : null}

          <TextInput
            className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <TouchableOpacity
            className="rounded-xl py-4"
            style={{ backgroundColor: COLORS.primary }}
            onPress={handleReset}
            disabled={submitting}
          >
            <Text className="text-center text-lg font-semibold text-white">
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          <Link href="/auth/login" className="mt-6 text-center font-medium" style={{ color: COLORS.secondary }}>
            Back to Log In
          </Link>
        </View>
      </KeyboardAvoidingView>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  webForm: {
    gap: WEB_TOKENS.spacing.md,
  },
  formError: {
    ...WEB_TOKENS.typography.caption,
    backgroundColor: WEB_TOKENS.colors.errorSurface,
    borderColor: WEB_TOKENS.colors.errorBorder,
    borderRadius: WEB_TOKENS.radii.sm,
    borderWidth: 1,
    color: WEB_TOKENS.colors.error,
    padding: WEB_TOKENS.spacing.sm,
  },
  submitButton: {
    marginTop: WEB_TOKENS.spacing.sm,
    width: '100%',
  },
  centerLink: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    textAlign: 'center',
  },
  success: {
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.lg,
  },
  successTitle: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    fontSize: 24,
    textAlign: 'center',
  },
  successCopy: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.textMuted,
    lineHeight: 24,
    textAlign: 'center',
  },
  legalCopy: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    textAlign: 'center',
  },
  legalLinks: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WEB_TOKENS.spacing.xs,
    justifyContent: 'center',
  },
  legalLink: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    textDecorationLine: 'underline',
  },
  mutedText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
});
