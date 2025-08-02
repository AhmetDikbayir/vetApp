import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';

interface SocialLoginButtonProps {
  type: 'google' | 'apple';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  type,
  onPress,
  loading = false,
  disabled = false,
}) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'google':
        return styles.googleButton;
      case 'apple':
        return styles.appleButton;
      default:
        return styles.googleButton;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'google':
        return styles.googleText;
      case 'apple':
        return styles.appleText;
      default:
        return styles.googleText;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'google':
        return '🔍';
      case 'apple':
        return '🍎';
      default:
        return '';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'google':
        return 'Google ile Giriş Yap';
      case 'apple':
        return 'Apple ile Giriş Yap';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={type === 'google' ? '#4285F4' : '#000000'}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          <Text style={styles.icon}>{getIcon()}</Text>
          <Text style={[styles.title, getTextStyle()]}>{getTitle()}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
    minHeight: 56,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  googleText: {
    color: '#4285F4',
  },
  appleText: {
    color: '#FFFFFF',
  },
}); 