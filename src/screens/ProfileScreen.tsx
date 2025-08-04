import React, { useState, useEffect } from 'react';
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
import { clinicService } from '../services/clinicService';
import { veterinarianService } from '../services/veterinarianService';
import { Clinic } from '../types/clinic';
import auth from '@react-native-firebase/auth';

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
    role: user?.role || 'hayvan_sahibi',
    clinicId: '',
  });
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showClinicDropdown, setShowClinicDropdown] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [showAddClinicModal, setShowAddClinicModal] = useState(false);
  const [newClinicData, setNewClinicData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  // Kullanıcı bilgilerini logla
  console.log('ProfileScreen: Mevcut kullanıcı bilgileri:', user);
  console.log('ProfileScreen: Kullanıcı ID:', user?.id);

  // Klinikleri yükle
  const loadClinics = async () => {
    try {
      setLoadingClinics(true);
      const clinicsData = await clinicService.getClinics();
      setClinics(clinicsData);
    } catch (error) {
      console.error('Klinikler yüklenirken hata:', error);
    } finally {
      setLoadingClinics(false);
    }
  };

  // Modal açıldığında klinikleri yükle
  useEffect(() => {
    if (isEditModalVisible) {
      loadClinics();
    }
  }, [isEditModalVisible]);

  // Profil ekranı açıldığında klinikleri yükle (veteriner rolü için)
  useEffect(() => {
    if (user?.role === 'veteriner') {
      loadClinics();
    }
  }, [user?.role]);

  const getSelectedClinicName = () => {
    if (!formData.clinicId) return 'Klinik Seçin';
    const clinic = clinics.find(c => c.id === formData.clinicId);
    return clinic ? clinic.name : 'Klinik Seçin';
  };

  const handleAddClinic = async () => {
    if (!newClinicData.name || !newClinicData.address || !newClinicData.phone) {
      Alert.alert('Hata', 'Lütfen gerekli alanları doldurun');
      return;
    }

    try {
      const newClinic = await clinicService.createClinic({
        name: newClinicData.name,
        address: {
          street: newClinicData.address,
          city: '',
          state: '',
          zipCode: '',
          country: 'Türkiye',
        },
        phone: newClinicData.phone,
        email: newClinicData.email,
        description: '',
        services: [],
        facilities: [],
        emergencyService: false,
        isOpen24Hours: false,
        location: { latitude: 0, longitude: 0 },
      });

      setClinics([...clinics, newClinic]);
      setFormData({ ...formData, clinicId: newClinic.id! });
      setShowAddClinicModal(false);
      setNewClinicData({ name: '', address: '', phone: '', email: '' });
      Alert.alert('Başarılı', 'Klinik başarıyla eklendi');
    } catch (error) {
      console.error('Klinik ekleme hatası:', error);
      Alert.alert('Hata', 'Klinik eklenirken hata oluştu');
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'veteriner':
        return 'Veteriner';
      case 'hayvan_sahibi':
        return 'Hayvan Sahibi';
      default:
        return 'Belirtilmemiş';
    }
  };

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

    // Veteriner rolü seçildiyse klinik kontrolü yap
    if (formData.role === 'veteriner' && !formData.clinicId) {
      Alert.alert('Hata', 'Veteriner rolü için klinik seçimi zorunludur.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('ProfileScreen: Profil güncelleme başlatılıyor...');
      console.log('ProfileScreen: User ID:', user.id);
      console.log('ProfileScreen: Mevcut email:', user.email);
      console.log('ProfileScreen: Yeni email:', formData.email.trim());
      console.log('ProfileScreen: Güncellenecek veriler:', formData);

      // Kullanıcının gerçekten giriş yapmış olup olmadığını kontrol et
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
      }

      console.log('ProfileScreen: Firebase Auth kullanıcısı doğrulandı:', currentUser.uid);

      await userService.updateUser(user.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        clinicId: formData.role === 'veteriner' ? formData.clinicId : undefined,
      });

      console.log('ProfileScreen: Firestore güncelleme başarılı');

      // Eğer kullanıcı veteriner rolüne geçiyorsa, veterinarians collection'ına kayıt ekle
      if (formData.role === 'veteriner' && formData.clinicId) {
        try {
          const selectedClinic = clinics.find(c => c.id === formData.clinicId);
          if (selectedClinic) {
            await veterinarianService.createVeterinarian({
              userId: user.id, // Kullanıcı ID'sini ekle
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: '', // Varsayılan boş telefon
              clinicId: formData.clinicId,
              specialization: ['Genel Veterinerlik'], // Varsayılan uzmanlık
              experience: 0, // Varsayılan deneyim
              education: 'Veteriner Fakültesi', // Varsayılan eğitim
              licenseNumber: 'VET-' + user.id.substring(0, 8), // Varsayılan lisans numarası
              workingHours: {
                monday: { start: '09:00', end: '18:00', isWorking: true },
                tuesday: { start: '09:00', end: '18:00', isWorking: true },
                wednesday: { start: '09:00', end: '18:00', isWorking: true },
                thursday: { start: '09:00', end: '18:00', isWorking: true },
                friday: { start: '09:00', end: '18:00', isWorking: true },
                saturday: { start: '09:00', end: '16:00', isWorking: true },
                sunday: { start: '00:00', end: '00:00', isWorking: false },
              },
            });
            console.log('ProfileScreen: Veteriner kaydı oluşturuldu');
          }
        } catch (veterinarianError) {
          console.error('ProfileScreen: Veteriner kaydı oluşturma hatası:', veterinarianError);
          // Veteriner kaydı oluşturulamazsa kullanıcıya bilgi ver ama işlemi durdurma
          Alert.alert('Uyarı', 'Veteriner kaydı oluşturulamadı, ancak profil güncellendi.');
        }
      }

      // Auth context'teki kullanıcı bilgilerini güncelle
      if (updateUser) {
        const updatedUserData = {
          ...user,
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          clinicId: formData.role === 'veteriner' ? formData.clinicId : undefined,
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
          case 'firestore/not-found':
            errorMessage = 'Kullanıcı verisi bulunamadı.';
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
      role: user?.role || 'hayvan_sahibi',
      clinicId: user?.clinicId || '',
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

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rol</Text>
              <Text style={styles.infoValue}>{getRoleDisplayName(user?.role || '')}</Text>
            </View>

            {user?.role === 'veteriner' && user?.clinicId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Klinik</Text>
                <Text style={styles.infoValue}>
                  {clinics.find(c => c.id === user.clinicId)?.name || 'Klinik bilgisi yükleniyor...'}
                </Text>
              </View>
            )}
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

              {/* Rol Seçimi */}
              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Rol</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {getRoleDisplayName(formData.role)}
                  </Text>
                  <Text style={styles.dropdownArrow}>{showRoleDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                
                {showRoleDropdown && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({ ...formData, role: 'veteriner', clinicId: '' });
                        setShowRoleDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Veteriner</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({ ...formData, role: 'hayvan_sahibi', clinicId: '' });
                        setShowRoleDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Hayvan Sahibi</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Klinik Seçimi - Sadece Veteriner rolü seçildiğinde göster */}
              {formData.role === 'veteriner' && (
                <View style={styles.roleContainer}>
                  <Text style={styles.roleLabel}>Klinik</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowClinicDropdown(!showClinicDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {getSelectedClinicName()}
                    </Text>
                    <Text style={styles.dropdownArrow}>{showClinicDropdown ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  
                  {showClinicDropdown && (
                    <View style={styles.dropdownList}>
                      {loadingClinics ? (
                        <View style={styles.loadingItem}>
                          <Text style={styles.loadingText}>Klinikler yükleniyor...</Text>
                        </View>
                      ) : (
                        <>
                          {clinics.map((clinic) => (
                            <TouchableOpacity
                              key={clinic.id}
                              style={styles.dropdownItem}
                              onPress={() => {
                                setFormData({ ...formData, clinicId: clinic.id! });
                                setShowClinicDropdown(false);
                              }}
                            >
                              <Text style={styles.dropdownItemText}>{clinic.name}</Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity
                            style={[styles.dropdownItem, styles.addClinicItem]}
                            onPress={() => {
                              setShowClinicDropdown(false);
                              setShowAddClinicModal(true);
                            }}
                          >
                            <Text style={[styles.dropdownItemText, styles.addClinicText]}>
                              + Yeni Klinik Ekle
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </View>
              )}

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

      {/* Add Clinic Modal */}
      <Modal
        visible={showAddClinicModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddClinicModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Klinik Ekle</Text>
              <TouchableOpacity
                onPress={() => setShowAddClinicModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Klinik Adı"
                value={newClinicData.name}
                onChangeText={(text) => setNewClinicData({ ...newClinicData, name: text })}
                placeholder="Klinik adını girin"
              />
              <Input
                label="Adres"
                value={newClinicData.address}
                onChangeText={(text) => setNewClinicData({ ...newClinicData, address: text })}
                placeholder="Klinik adresini girin"
              />
              <Input
                label="Telefon"
                value={newClinicData.phone}
                onChangeText={(text) => setNewClinicData({ ...newClinicData, phone: text })}
                placeholder="Telefon numarasını girin"
                keyboardType="phone-pad"
              />
              <Input
                label="E-posta"
                value={newClinicData.email}
                onChangeText={(text) => setNewClinicData({ ...newClinicData, email: text })}
                placeholder="E-posta adresini girin"
                keyboardType="email-address"
              />

              <View style={styles.modalButtons}>
                <Button
                  title="İptal"
                  onPress={() => setShowAddClinicModal(false)}
                  style={styles.cancelButton}
                  variant="secondary"
                />
                <Button
                  title="Ekle"
                  onPress={handleAddClinic}
                  style={styles.saveButton}
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
  roleContainer: {
    marginTop: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666666',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginTop: -8,
    marginBottom: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  loadingItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  addClinicItem: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
  },
  addClinicText: {
    color: '#007AFF',
    fontWeight: '600',
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