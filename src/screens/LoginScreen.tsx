import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SocialLoginButton } from '../components/SocialLoginButton';
import { useAuthContext } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    isLoading,
  } = useAuthContext();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleEmailSignIn = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    if (!email.trim()) {
      setEmailError('Email adresi gereklidir');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Geçerli bir email adresi giriniz');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Şifre gereklidir');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      await signInWithEmail({ email, password });
      Alert.alert('Başarılı', 'Giriş yapıldı!');
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Giriş başarısız');
    }
  };

  const handleEmailSignUp = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    if (!email.trim()) {
      setEmailError('Email adresi gereklidir');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Geçerli bir email adresi giriniz');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Şifre gereklidir');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      await signUpWithEmail({ email, password });
      Alert.alert('Başarılı', 'Hesap oluşturuldu!');
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Kayıt başarısız');
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("Google Sign-In butonuna tıklandı!");
    try {
      await signInWithGoogle();
      // Başarılı giriş sonrası otomatik olarak HomeScreen'e yönlendirilecek
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Google ile giriş başarısız');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      Alert.alert('Başarılı', 'Apple ile giriş yapıldı!');
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Apple ile giriş başarısız');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>VetApp'e Hoş Geldiniz</Text>
            <Text style={styles.subtitle}>
              Veteriner hekimlerinizle iletişime geçin
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <Input
              label="Şifre"
              placeholder="Şifrenizi giriniz"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={passwordError}
            />

            <Button
              title="Giriş Yap"
              onPress={handleEmailSignIn}
              loading={isLoading}
              style={styles.loginButton}
            />
            
            <Button
              title="Kayıt Ol"
              onPress={handleEmailSignUp}
              loading={isLoading}
              style={styles.signUpButton}
              variant="secondary"
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <SocialLoginButton
              type="google"
              onPress={handleGoogleSignIn}
              loading={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Hesabınız yok mu?{' '}
              <Text style={styles.linkText}>Kayıt olun</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 16,
  },
  signUpButton: {
    marginTop: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  socialButtons: {
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
}); 