import { useAuthStore } from '@/src/stores/auth';
import { COLORS } from '@/src/constants/theme';
import { Link } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await resetPassword(email);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
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
    );
  }

  return (
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
  );
}
