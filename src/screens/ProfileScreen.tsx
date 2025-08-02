import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { userService } from '../services/userService';

interface ProfileScreenProps {
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { user, updateUser } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Kullanıcı bilgilerini logla
  console.log('ProfileScreen: Mevcut kullanıcı bilgileri:', user);
  console.log('ProfileScreen: Kullanıcı ID:', user?.id);

  const handleUpdateProfile = async () => {
    if (!user) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı.');
      return;
    }

    if (!user.id) {
      Alert.alert('Hata', 'Kullanıcı ID bulunamadı.');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert('Hata', 'Ad ve e-posta alanları boş olamaz.');
      return;
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('ProfileScreen: Profil güncelleme başlatılıyor...');
      console.log('ProfileScreen: User ID:', user.id);
      console.log('ProfileScreen: Mevcut email:', user.email);
      console.log('ProfileScreen: Yeni email:', formData.email.trim());
      console.log('ProfileScreen: Güncellenecek veriler:', formData);

      await userService.updateUser(user.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      console.log('ProfileScreen: Firestore güncelleme başarılı');

      // Auth context'teki kullanıcı bilgilerini güncelle
      if (updateUser) {
        const updatedUserData = {
          ...user,
          name: formData.name.trim(),
          email: formData.email.trim(),
        };
        updateUser(updatedUserData);
        console.log('ProfileScreen: Auth context güncellendi:', updatedUserData);
      }

      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('ProfileScreen: Profil güncelleme hatası:', error);
      
      // Firebase hata kodlarını kontrol et
      let errorMessage = 'Bilinmeyen bir hata oluştu';
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        switch (firebaseError.code) {
          case 'firestore/permission-denied':
            errorMessage = 'Firestore izin hatası. Lütfen tekrar giriş yapın.';
            break;
          case 'firestore/unavailable':
            errorMessage = 'Firestore servisi şu anda kullanılamıyor.';
            break;
          case 'firestore/deadline-exceeded':
            errorMessage = 'İşlem zaman aşımına uğradı.';
            break;
          default:
            errorMessage = firebaseError.message || 'Bilinmeyen bir hata oluştu';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert('Hata', `Profil güncellenirken bir hata oluştu: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = () => {
    const currentFormData = {
      name: user?.name || '',
      email: user?.email || '',
    };
    console.log('ProfileScreen: Modal açılıyor, form verileri:', currentFormData);
    setFormData(currentFormData);
    setIsEditModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>

          <View style={styles.userInfoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ad Soyad</Text>
              <Text style={styles.infoValue}>{user?.name || 'Belirtilmemiş'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>E-posta</Text>
              <Text style={styles.infoValue}>{user?.email || 'Belirtilmemiş'}</Text>
            </View>
          </View>

          <Button
            title="Bilgileri Güncelle"
            onPress={openEditModal}
            style={styles.updateButton}
          />
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bilgileri Güncelle</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Ad Soyad"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Adınızı ve soyadınızı girin"
              />

              <Input
                label="E-posta"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="E-posta adresinizi girin"
                keyboardType="email-address"
              />

              <View style={styles.modalButtons}>
                <Button
                  title="İptal"
                  onPress={() => setIsEditModalVisible(false)}
                  style={styles.cancelButton}
                  variant="secondary"
                />
                <Button
                  title="Güncelle"
                  onPress={handleUpdateProfile}
                  style={styles.saveButton}
                  loading={isLoading}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 50,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'monospace',
  },
  updateButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666666',
  },
  formContainer: {
    padding: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
}); 