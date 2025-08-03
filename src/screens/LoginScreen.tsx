import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SocialLoginButton } from '../components/SocialLoginButton';
import { SignUpModal } from '../components/SignUpModal';
import { useAuthContext } from '../context/AuthContext';
import { styles } from '../styles/loginScreenStyles';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Kayıt modalı için state
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);

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

  const openSignUpModal = () => {
    setIsSignUpModalVisible(true);
  };

  const closeSignUpModal = () => {
    setIsSignUpModalVisible(false);
  };

  const handleEmailSignUp = async (email: string, password: string, firstName: string, lastName: string, role: string) => {
    try {
      await signUpWithEmail({ email, password, firstName, lastName, role });
      Alert.alert('Başarılı', 'Hesap oluşturuldu!');
      closeSignUpModal();
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
              onPress={openSignUpModal}
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
          <View style={styles.socialButtons}>
            <SocialLoginButton
              type="apple"
              onPress={handleAppleSignIn}
              loading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Kayıt Modalı */}
      <SignUpModal
        visible={isSignUpModalVisible}
        onClose={closeSignUpModal}
        onSignUp={handleEmailSignUp}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
};

 