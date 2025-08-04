import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { clinicService } from '../services/clinicService';
import { veterinarianService } from '../services/veterinarianService';
import { appointmentService } from '../services/appointmentService';
import { petService } from '../services/petService';
import { Clinic } from '../types/clinic';
import { Veterinarian } from '../types/veterinarian';
import { Pet } from '../types/pet';

interface AppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (appointment: any) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedVeterinarian, setSelectedVeterinarian] = useState<Veterinarian | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [appointmentType, setAppointmentType] = useState<'checkup' | 'vaccination' | 'surgery' | 'emergency' | 'consultation' | 'other'>('checkup');
  const [reason, setReason] = useState('');
  
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [loadingVeterinarians, setLoadingVeterinarians] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const appointmentTypes = [
    { value: 'checkup', label: 'Genel Muayene' },
    { value: 'vaccination', label: 'Aşı' },
    { value: 'surgery', label: 'Ameliyat' },
    { value: 'emergency', label: 'Acil Durum' },
    { value: 'consultation', label: 'Konsültasyon' },
    { value: 'other', label: 'Diğer' },
  ];

  // Gelecek 7 gün için tarih seçenekleri
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
      const dayNumber = date.getDate();
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
      
      dates.push({
        value: date.toISOString().split('T')[0],
        display: `${dayName} ${dayNumber} ${monthName}`,
        fullDate: date.toLocaleDateString('tr-TR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      });
    }
    
    return dates;
  };

  // Klinikleri yükle
  useEffect(() => {
    if (visible) {
      loadClinics();
      loadPets();
    }
  }, [visible]);

  // Veterinerleri yükle (klinik seçildiğinde)
  useEffect(() => {
    if (selectedClinic) {
      loadVeterinarians(selectedClinic.id!);
    } else {
      setVeterinarians([]);
      setSelectedVeterinarian(null);
    }
  }, [selectedClinic]);

  const loadClinics = async () => {
    try {
      setLoadingClinics(true);
      const clinicsData = await clinicService.getClinics();
      setClinics(clinicsData);
    } catch (error) {
      console.error('Klinikler yüklenirken hata:', error);
      Alert.alert('Hata', 'Klinikler yüklenirken bir hata oluştu');
    } finally {
      setLoadingClinics(false);
    }
  };

  const loadVeterinarians = async (clinicId: string) => {
    try {
      setLoadingVeterinarians(true);
      console.log('AppointmentModal: Klinik ID:', clinicId);
      
      // Debug: Tüm veterinerleri getir
      const allVets = await veterinarianService.getAllVeterinarians();
      console.log('AppointmentModal: Tüm veterinerler:', allVets);
      
      const veterinariansData = await veterinarianService.getVeterinariansByClinic(clinicId);
      console.log('AppointmentModal: Klinik veterinerleri:', veterinariansData);
      
      setVeterinarians(veterinariansData);
    } catch (error) {
      console.error('Veterinerler yüklenirken hata:', error);
      Alert.alert('Hata', 'Veterinerler yüklenirken bir hata oluştu');
    } finally {
      setLoadingVeterinarians(false);
    }
  };

  const loadPets = async () => {
    try {
      const petsData = await petService.getPets();
      setPets(petsData);
    } catch (error) {
      console.error('Evcil hayvanlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Evcil hayvanlar yüklenirken bir hata oluştu');
    }
  };

  const handleConfirm = async () => {
    if (!selectedDate) {
      Alert.alert('Uyarı', 'Lütfen bir tarih seçin');
      return;
    }
    
    if (!selectedClinic) {
      Alert.alert('Uyarı', 'Lütfen bir klinik seçin');
      return;
    }

    if (!selectedVeterinarian) {
      Alert.alert('Uyarı', 'Lütfen bir veteriner seçin');
      return;
    }

    if (!selectedPet) {
      Alert.alert('Uyarı', 'Lütfen bir evcil hayvan seçin');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Uyarı', 'Lütfen randevu sebebini belirtin');
      return;
    }

    try {
      setLoading(true);
      
      // Müsaitlik kontrolü (opsiyonel)
      let isAvailable = true;
      try {
        isAvailable = await appointmentService.checkAvailability(
          selectedVeterinarian.id!,
          selectedDate,
          selectedTime
        );
      } catch (availabilityError) {
        console.warn('Müsaitlik kontrolü başarısız, randevu oluşturmaya devam ediliyor:', availabilityError);
        // Müsaitlik kontrolü başarısız olsa bile randevu oluşturmaya devam et
      }

      if (!isAvailable) {
        Alert.alert('Uyarı', 'Seçilen tarih ve saatte veteriner müsait değil. Lütfen başka bir zaman seçin.');
        return;
      }

      // Randevu oluştur
      const appointmentData = {
        petId: selectedPet.id!,
        veterinarianId: selectedVeterinarian.id!,
        clinicId: selectedClinic.id!,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        reason: reason.trim(),
      };

      const appointment = await appointmentService.createAppointment(appointmentData);
      
      onConfirm({
        appointment,
        clinic: selectedClinic,
        veterinarian: selectedVeterinarian,
        pet: selectedPet,
      });
      
      // Formu sıfırla
      setSelectedDate('');
      setSelectedTime('09:00');
      setSelectedClinic(null);
      setSelectedVeterinarian(null);
      setSelectedPet(null);
      setAppointmentType('checkup');
      setReason('');
      
      onClose();
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      
      // Daha spesifik hata mesajları
      let errorMessage = 'Randevu oluşturulurken bir hata oluştu';
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as { message: string };
        if (errorObj.message.includes('Müsaitlik kontrol')) {
          errorMessage = 'Müsaitlik kontrolü sırasında bir hata oluştu. Lütfen tekrar deneyin.';
        } else if (errorObj.message.includes('Kullanıcı oturumu')) {
          errorMessage = 'Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.';
        } else if (errorObj.message.includes('permission-denied')) {
          errorMessage = 'Bu işlem için yetkiniz bulunmuyor. Lütfen tekrar giriş yapın.';
        }
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const availableDates = getAvailableDates();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Randevu Al</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Tarih Seçimi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Tarih Seçin</Text>
              <View style={styles.dateGrid}>
                {availableDates.map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateOption,
                      selectedDate === date.value && styles.selectedDate,
                    ]}
                    onPress={() => setSelectedDate(date.value)}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        selectedDate === date.value && styles.selectedDateText,
                      ]}
                    >
                      {date.display}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Saat Seçimi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🕐 Saat Seçin</Text>
              <View style={styles.timeGrid}>
                {timeSlots.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeOption,
                      selectedTime === time && styles.selectedTime,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        selectedTime === time && styles.selectedTimeText,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Klinik Seçimi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏥 Klinik Seçin</Text>
              {loadingClinics ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <View style={styles.clinicGrid}>
                  {clinics.map((clinic, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.clinicOption,
                        selectedClinic?.id === clinic.id && styles.selectedClinic,
                      ]}
                      onPress={() => setSelectedClinic(clinic)}
                    >
                      <Text
                        style={[
                          styles.clinicText,
                          selectedClinic?.id === clinic.id && styles.selectedClinicText,
                        ]}
                      >
                        {clinic.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Veteriner Seçimi */}
            {selectedClinic && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👨‍⚕️ Veteriner Seçin</Text>
                {loadingVeterinarians ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <View style={styles.veterinarianGrid}>
                    {veterinarians.map((veterinarian, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.veterinarianOption,
                          selectedVeterinarian?.id === veterinarian.id && styles.selectedVeterinarian,
                        ]}
                        onPress={() => setSelectedVeterinarian(veterinarian)}
                      >
                        <Text
                          style={[
                            styles.veterinarianText,
                            selectedVeterinarian?.id === veterinarian.id && styles.selectedVeterinarianText,
                          ]}
                        >
                          {veterinarian.name}
                        </Text>
                                                 <Text
                           style={[
                             styles.veterinarianSpecialization,
                             selectedVeterinarian?.id === veterinarian.id && styles.selectedVeterinarianText,
                           ]}
                         >
                           {Array.isArray(veterinarian.specialization) 
                             ? veterinarian.specialization.join(', ') 
                             : veterinarian.specialization || 'Uzmanlık belirtilmemiş'}
                         </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Evcil Hayvan Seçimi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🐾 Evcil Hayvan Seçin</Text>
              <View style={styles.petGrid}>
                {pets.map((pet, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.petOption,
                      selectedPet?.id === pet.id && styles.selectedPet,
                    ]}
                    onPress={() => setSelectedPet(pet)}
                  >
                    <Text
                      style={[
                        styles.petText,
                        selectedPet?.id === pet.id && styles.selectedPetText,
                      ]}
                    >
                      {pet.name}
                    </Text>
                    <Text
                      style={[
                        styles.petType,
                        selectedPet?.id === pet.id && styles.selectedPetText,
                      ]}
                    >
                      {pet.type} - {pet.breed}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Randevu Türü */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏷️ Randevu Türü</Text>
              <View style={styles.typeGrid}>
                {appointmentTypes.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.typeOption,
                      appointmentType === type.value && styles.selectedType,
                    ]}
                    onPress={() => setAppointmentType(type.value as any)}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        appointmentType === type.value && styles.selectedTypeText,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sebep */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Randevu Sebebi</Text>
              <TextInput
                style={styles.reasonInput}
                value={reason}
                onChangeText={setReason}
                placeholder="Randevu sebebini belirtin..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Butonlar */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, loading && styles.disabledButton]} 
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>Randevu Al</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '80%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateOption: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  selectedDate: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dateText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedDateText: {
    color: 'white',
  },
  clinicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  clinicOption: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  selectedClinic: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  clinicText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedClinicText: {
    color: 'white',
  },
  veterinarianGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  veterinarianOption: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  selectedVeterinarian: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  veterinarianText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  veterinarianSpecialization: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedVeterinarianText: {
    color: 'white',
  },
  petGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  petOption: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  selectedPet: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  petText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  petType: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedPetText: {
    color: 'white',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedTypeText: {
    color: 'white',
  },
  reasonInput: {
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedTime: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedTimeText: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default AppointmentModal; 