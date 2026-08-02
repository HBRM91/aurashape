import { useAuthStore } from '@/src/stores/auth';
import { COLORS } from '@/src/constants/theme';
import { Link } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { GoogleLogo, AppleLogo } from 'phosphor-react-native';
import { AuthFrame } from '@/src/web/AuthFrame';
import { WebButton } from '@/src/web/WebButton';
import { WebField } from '@/src/web/WebField';
import { WEB_TOKENS } from '@/src/web/tokens';

export default function LoginScreen() {
  const { signIn, signInWithGoogle, signInWithApple } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [oauthProvider, setOAuthProvider] = useState<'google' | 'apple' | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'email' | 'password', string>>>({});
  const { width } = useWindowDimensions();
  const isNarrowWeb = Platform.OS === 'web' && width > 0 && width < 480;

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      setFieldErrors({
        email: email ? undefined : 'Email is required',
        password: password ? undefined : 'Password is required',
      });
      return;
    }
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    if (submitting) return;
    setSubmitting(true);
    setOAuthProvider(provider);
    setError('');
    setFieldErrors({});
    try {
      const result = await (provider === 'google' ? signInWithGoogle() : signInWithApple());
      if (result.error) setError(result.error);
    } catch (oauthError) {
      setError(oauthError instanceof Error ? oauthError.message : 'Unable to continue with OAuth');
    } finally {
      setSubmitting(false);
      setOAuthProvider(null);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <AuthFrame heading="Welcome back" subtitle="Log in to continue your journey">
        <View style={styles.webForm}>
          {error ? <Text accessibilityLiveRegion="polite" style={styles.formError}>{error}</Text> : null}
          <WebField
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            error={fieldErrors.email}
            onChangeText={(value) => {
              setEmail(value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder="you@example.com"
            textContentType="emailAddress"
            value={email}
          />
          <WebField
            autoComplete="current-password"
            label="Password"
            error={fieldErrors.password}
            onChangeText={(value) => {
              setPassword(value);
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder="Enter your password"
            secureTextEntry
            textContentType="password"
            value={password}
          />
          <WebButton
            disabled={submitting}
            label={submitting ? 'Logging in...' : 'Log In'}
            onPress={handleLogin}
            style={styles.submitButton}
          />
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>
          <View style={[styles.oauthRow, isNarrowWeb ? styles.oauthColumn : undefined]}>
            <WebButton
              disabled={submitting}
              label={oauthProvider === 'google' ? 'Connecting with Google...' : 'Continue with Google'}
              onPress={() => handleOAuth('google')}
              style={styles.oauthButton}
              variant="secondary"
            />
            <WebButton
              disabled={submitting}
              label={oauthProvider === 'apple' ? 'Connecting with Apple...' : 'Continue with Apple'}
              onPress={() => handleOAuth('apple')}
              style={styles.oauthButton}
              variant="secondary"
            />
          </View>
          <View style={styles.accountPrompt}>
            <Text style={styles.mutedText}>Don't have an account?</Text>
            <Link accessibilityRole="link" href="/auth/signup" style={styles.link}>Sign Up</Link>
          </View>
          <Link accessibilityRole="link" href="/auth/forgot-password" style={styles.centerLink}>Forgot password?</Link>
          <Text style={styles.legalCopy}>By continuing, you agree to our</Text>
          <View style={styles.legalLinks}>
            <Link accessibilityRole="link" href="https://aurashape.app/privacy" style={styles.legalLink}>Privacy Policy</Link>
            <Text style={styles.mutedText}>and</Text>
            <Link accessibilityRole="link" href="https://aurashape.app/terms" style={styles.legalLink}>Terms of Service</Link>
          </View>
        </View>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame heading="Welcome back" subtitle="Log in to continue your journey">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <View className="flex-1 justify-center px-8">
          <Text className="mb-2 text-center text-3xl font-bold" style={{ color: COLORS.primaryDark }}>
            Aurashape
          </Text>
          <Text className="mb-8 text-center text-gray-500">
            Your free health companion
          </Text>

          {error ? (
            <View className="mb-4 rounded-lg bg-red-50 p-3">
              <Text className="text-center text-red-500">{error}</Text>
            </View>
          ) : null}

          <TextInput
            className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          <TouchableOpacity
            className="rounded-xl py-4"
            style={{ backgroundColor: COLORS.primary }}
            onPress={handleLogin}
            disabled={submitting}
          >
            <Text className="text-center text-lg font-semibold text-white">
              {submitting ? 'Logging in...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          <View className="my-6 flex-row items-center gap-3">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs text-gray-400">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={signInWithGoogle}
              className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200"
            >
              <GoogleLogo size={20} weight="bold" />
              <Text className="text-sm font-semibold text-gray-700">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={signInWithApple}
              className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200"
            >
              <AppleLogo size={20} weight="fill" />
              <Text className="text-sm font-semibold text-gray-700">Apple</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-gray-500">Don't have an account?</Text>
            <Link href="/auth/signup" className="font-semibold" style={{ color: COLORS.secondary }}>
              Sign Up
            </Link>
          </View>

          <Link
            href="/auth/forgot-password"
            className="mt-3 text-center font-medium"
            style={{ color: COLORS.secondary }}
          >
            Forgot password?
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
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    marginVertical: WEB_TOKENS.spacing.sm,
  },
  dividerLine: {
    backgroundColor: WEB_TOKENS.colors.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  oauthRow: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
  },
  oauthColumn: {
    flexDirection: 'column',
  },
  oauthButton: {
    flex: 1,
  },
  accountPrompt: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.xs,
    justifyContent: 'center',
    marginTop: WEB_TOKENS.spacing.sm,
  },
  mutedText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  link: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
  },
  centerLink: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    textAlign: 'center',
  },
  legalCopy: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: WEB_TOKENS.spacing.sm,
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
});
