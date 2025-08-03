import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity, 
  Platform,
  ScrollView,
} from 'react-native';
import { Button } from './Button';
import { Input } from './Input';
import { styles } from '../styles/registerModalStyles';

interface SignUpModalProps {
  visible: boolean;
  onClose: () => void;
  onSignUp: (email: string, password: string, firstName: string, lastName: string, role: string) => Promise<void>;
  isLoading: boolean;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  visible,
  onClose,
  onSignUp,
  isLoading,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [roleError, setRoleError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleSignUp = async () => {
    // Reset errors
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setRoleError('');

    // Validate inputs
    if (!firstName.trim()) {
      setFirstNameError('Ad gereklidir');
      return;
    }

    if (!lastName.trim()) {
      setLastNameError('Soyad gereklidir');
      return;
    }

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

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Şifre tekrarı gereklidir');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Şifreler eşleşmiyor');
      return;
    }

    if (!role.trim()) {
      setRoleError('Rol seçimi gereklidir');
      return;
    }

    try {
      await onSignUp(email, password, firstName, lastName, role);
      // Başarılı kayıt sonrası form temizle
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('');
    } catch (error) {
      // Hata zaten onSignUp içinde handle ediliyor
    }
  };

  const handleClose = () => {
    // Form verilerini temizle
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('');
    setShowRoleDropdown(false);
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setRoleError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Hesap Oluştur</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <Input
              label="Ad"
              placeholder="Adınızı girin"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              error={firstNameError}
            />

            <Input
              label="Soyad"
              placeholder="Soyadınızı girin"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              error={lastNameError}
            />

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
              placeholder="En az 6 karakter"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={passwordError}
            />

            <Input
              label="Şifre Tekrarı"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={confirmPasswordError}
            />

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Rol Seçimi</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                <Text style={styles.dropdownButtonText}>
                  {role ? (role === 'veteriner' ? 'Veteriner' : 'Hayvan Sahibi') : 'Rol seçiniz'}
                </Text>
                <Text style={styles.dropdownArrow}>{showRoleDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {showRoleDropdown && (
                <View style={styles.dropdownList}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setRole('veteriner');
                      setShowRoleDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Veteriner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setRole('hayvan_sahibi');
                      setShowRoleDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Hayvan Sahibi</Text>
                  </TouchableOpacity>
                </View>
              )}
              {roleError ? <Text style={styles.errorText}>{roleError}</Text> : null}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="İptal"
                onPress={handleClose}
                style={styles.cancelButton}
                variant="secondary"
              />
              <Button
                title="Kayıt Ol"
                onPress={handleSignUp}
                loading={isLoading}
                style={styles.confirmButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}; 