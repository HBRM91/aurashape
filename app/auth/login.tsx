import { useAuthStore } from '@/src/stores/auth';
import { COLORS } from '@/src/constants/theme';
import { Link } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { GoogleLogo, AppleLogo } from 'phosphor-react-native';

export default function LoginScreen() {
  const { signIn, signInWithGoogle, signInWithApple } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
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
  );
}
