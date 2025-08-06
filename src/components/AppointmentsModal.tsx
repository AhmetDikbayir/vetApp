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
} from 'react-native';
import { appointmentService } from '../services/appointmentService';
import { clinicService } from '../services/clinicService';
import { veterinarianService } from '../services/veterinarianService';
import { petService } from '../services/petService';
import { Appointment } from '../types/appointment';
import { Clinic } from '../types/clinic';
import { Veterinarian } from '../types/veterinarian';
import { Pet } from '../types/pet';
import { useAuth } from '../hooks/useAuth';

interface AppointmentsModalProps {
  visible: boolean;
  onClose: () => void;
}

const AppointmentsModal: React.FC<AppointmentsModalProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAppointments();
    }
  }, [visible]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Önce gerekli verileri yükle
      const [clinicsData, veterinariansData, petsData] = await Promise.all([
        clinicService.getClinics(),
        veterinarianService.getVeterinarians(),
        petService.getPets(),
      ]);
      
      setClinics(clinicsData);
      setVeterinarians(veterinariansData);
      setPets(petsData);
      
      let appointmentsData: Appointment[];
      
      if (user?.role === 'veteriner') {
        // Veteriner için: kendisine gelen randevuları getir
        const currentVeterinarian = veterinariansData.find(v => v.userId === user.id);
        if (currentVeterinarian) {
          appointmentsData = await appointmentService.getVeterinarianAppointments(currentVeterinarian.id!);
        } else {
          appointmentsData = [];
        }
      } else {
        // Hayvan sahibi için: kendi randevularını getir
        appointmentsData = await appointmentService.getUserAppointments();
      }
      
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
      Alert.alert('Hata', 'Randevular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getClinicName = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic?.name || 'Bilinmeyen Klinik';
  };

  const getVeterinarianName = (veterinarianId: string) => {
    const veterinarian = veterinarians.find(v => v.id === veterinarianId);
    return veterinarian?.name || 'Bilinmeyen Veteriner';
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.name || 'Bilinmeyen Hayvan';
  };

  const getUserName = (userId: string) => {
    // Randevu verisinde hasta sahibinin email'i var, onu kullanabiliriz
    // Şimdilik sadece "Hasta Sahibi" olarak gösterelim
    return 'Hasta Sahibi';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'cancelled':
        return 'İptal Edildi';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'confirmed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const getAppointmentTypeText = (type: string) => {
    switch (type) {
      case 'checkup':
        return 'Genel Muayene';
      case 'vaccination':
        return 'Aşı';
      case 'surgery':
        return 'Ameliyat';
      case 'emergency':
        return 'Acil Durum';
      case 'consultation':
        return 'Konsültasyon';
      case 'other':
        return 'Diğer';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Randevu İptali',
      'Bu randevuyu iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentService.cancelAppointment(appointmentId);
              Alert.alert('Başarılı', 'Randevu iptal edildi');
              loadAppointments(); // Listeyi yenile
            } catch (error) {
              console.error('Randevu iptal hatası:', error);
              Alert.alert('Hata', 'Randevu iptal edilirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Randevu Onayı',
      'Bu randevuyu onaylamak istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Onayla',
          style: 'default',
          onPress: async () => {
            try {
              await appointmentService.confirmAppointment(appointmentId);
              Alert.alert('Başarılı', 'Randevu onaylandı');
              loadAppointments(); // Listeyi yenile
            } catch (error) {
              console.error('Randevu onay hatası:', error);
              Alert.alert('Hata', 'Randevu onaylanırken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Randevu Reddi',
      'Bu randevuyu reddetmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentService.rejectAppointment(appointmentId);
              Alert.alert('Başarılı', 'Randevu reddedildi');
              loadAppointments(); // Listeyi yenile
            } catch (error) {
              console.error('Randevu red hatası:', error);
              Alert.alert('Hata', 'Randevu reddedilirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

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
            <Text style={styles.title}>
              {user?.role === 'veteriner' ? 'Gelen Randevular' : 'Randevularım'}
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={loadAppointments} style={styles.refreshButton}>
                <Text style={styles.refreshButtonText}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Randevular yükleniyor...</Text>
              </View>
            ) : appointments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {user?.role === 'veteriner' ? 'Henüz gelen randevunuz bulunmuyor' : 'Henüz randevunuz bulunmuyor'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {user?.role === 'veteriner' 
                    ? 'Hastalarınız randevu aldığında burada görünecek'
                    : 'Randevu almak için ana ekrandaki "Randevu Al" butonunu kullanın'
                  }
                </Text>
              </View>
            ) : (
              appointments.map((appointment) => (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <Text style={styles.appointmentDate}>
                      {formatDate(appointment.date)}
                    </Text>
                    <Text style={styles.appointmentTime}>{appointment.time}</Text>
                  </View>
                  
                  <View style={styles.appointmentDetails}>
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Klinik: </Text>
                      {getClinicName(appointment.clinicId)}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Veteriner: </Text>
                      {getVeterinarianName(appointment.veterinarianId)}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Hayvan: </Text>
                      {getPetName(appointment.petId)}
                    </Text>
                    {user?.role === 'veteriner' && (
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Hasta Sahibi: </Text>
                        {getUserName(appointment.userId)}
                      </Text>
                    )}
                                         <Text style={styles.detailText}>
                       <Text style={styles.detailLabel}>Tür: </Text>
                       {getAppointmentTypeText(appointment.type)}
                     </Text>
                    {appointment.reason && (
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Sebep: </Text>
                        {appointment.reason}
                      </Text>
                    )}
                  </View>

                  <View style={styles.appointmentFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                      <Text style={styles.statusText}>
                        {getStatusText(appointment.status)}
                      </Text>
                    </View>
                    
                    {user?.role === 'veteriner' ? (
                      // Veteriner için onay/red butonları
                      appointment.status === 'pending' && (
                        <View style={styles.veterinarianButtons}>
                          <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => handleConfirmAppointment(appointment.id!)}
                          >
                            <Text style={styles.confirmButtonText}>Onayla</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={() => handleRejectAppointment(appointment.id!)}
                          >
                            <Text style={styles.rejectButtonText}>Reddet</Text>
                          </TouchableOpacity>
                        </View>
                      )
                    ) : (
                      // Hayvan sahibi için iptal butonu
                      appointment.status === 'pending' && (
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => handleCancelAppointment(appointment.id!)}
                        >
                          <Text style={styles.cancelButtonText}>İptal Et</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#666',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  appointmentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  appointmentDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#333',
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F44336',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  veterinarianButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  rejectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F44336',
    borderRadius: 8,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default AppointmentsModal; 