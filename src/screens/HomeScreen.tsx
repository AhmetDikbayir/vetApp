import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentsModal from '../components/AppointmentsModal';
import { styles } from '../styles/homeScreenStyles';

interface HomeScreenProps {
  onNavigateToAddPet: () => void;
  onNavigateToProfile: () => void;
  onNavigateToNotificationTest: () => void;
}



export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToAddPet, onNavigateToProfile, onNavigateToNotificationTest }) => {
  const { user, signOut } = useAuth();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  const handleSignOut = async () => {
    try {
      console.log('HomeScreen: Çıkış yapma işlemi başlatılıyor...');
      await signOut();
      console.log('HomeScreen: Çıkış yapma işlemi başarılı');
    } catch (error) {
      console.error('HomeScreen: Çıkış yapma hatası:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleAddPet = () => {
    onNavigateToAddPet();
  };

  const handleAppointmentPress = () => {
    setShowAppointmentModal(true);
  };

  const handleAppointmentsPress = () => {
    setShowAppointmentsModal(true);
  };

  const handleAppointmentConfirm = (appointmentData: any) => {
    console.log('Randevu alındı:', appointmentData);

    const { appointment, clinic, veterinarian, pet } = appointmentData;

    // Tarihi formatla
    const date = new Date(appointment.date);
    const formattedDate = date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    Alert.alert(
      'Randevu Başarılı!',
      `${clinic.name}\n${veterinarian.name}\n${pet.name}\n${formattedDate} - ${appointment.time}\n\nRandevunuz başarıyla oluşturuldu.`,
      [{
        text: 'Tamam',
        style: 'default',
        onPress: () => {
          // Randevu oluşturulduktan sonra randevular listesini yenile
          if (showAppointmentsModal) {
            // Eğer randevular modalı açıksa, yenile
            setShowAppointmentsModal(false);
            setTimeout(() => setShowAppointmentsModal(true), 100);
          }
        }
      }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
          <TouchableOpacity onPress={onNavigateToProfile} style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {user?.role === 'veteriner' ? 'Veteriner Paneli' : 'VetApp Hizmetleri'}
            </Text>

            {user?.role === 'veteriner' ? (
              // Veteriner için özel arayüz
              <>
                <TouchableOpacity style={styles.serviceCard} onPress={handleAppointmentsPress}>
                  <Text style={styles.serviceTitle}>📋 Gelen Randevular</Text>
                  <Text style={styles.serviceDescription}>
                    Size gelen randevuları görüntüleyin ve onaylayın
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.serviceCard}>
                  <Text style={styles.serviceTitle}>📊 Hasta Geçmişi</Text>
                  <Text style={styles.serviceDescription}>
                    Hastalarınızın geçmiş tedavi kayıtlarını görün
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.serviceCard}>
                  <Text style={styles.serviceTitle}>📅 Çalışma Saatleri</Text>
                  <Text style={styles.serviceDescription}>
                    Çalışma saatlerinizi düzenleyin
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.serviceCard}>
                  <Text style={styles.serviceTitle}>📈 İstatistikler</Text>
                  <Text style={styles.serviceDescription}>
                    Randevu ve hasta istatistiklerinizi görün
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={onNavigateToNotificationTest}
                >
                  <Text style={styles.serviceTitle}>🔔 OneSignal Test Ekranı</Text>
                  <Text style={styles.serviceDescription}>
                    OneSignal bildirim testleri ve logları
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // Hayvan sahibi için normal arayüz
              <>
                <TouchableOpacity style={styles.serviceCard} onPress={handleAddPet}>
                  <Text style={styles.serviceTitle}>🐾 Evcil Hayvanımı Kaydet</Text>
                  <Text style={styles.serviceDescription}>
                    Evcil hayvanınızın bilgilerini ekleyin ve takip edin
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.serviceCard} onPress={handleAppointmentPress}>
                  <Text style={styles.serviceTitle}>📅 Randevu Al</Text>
                  <Text style={styles.serviceDescription}>
                    Veteriner hekiminizle randevu oluşturun
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.serviceCard} onPress={handleAppointmentsPress}>
                  <Text style={styles.serviceTitle}>📋 Randevularım</Text>
                  <Text style={styles.serviceDescription}>
                    Mevcut randevularınızı görüntüleyin ve yönetin
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.serviceCard}>
                  <Text style={styles.serviceTitle}>🏥 Acil Durum</Text>
                  <Text style={styles.serviceDescription}>
                    Acil durumlarda en yakın veterineri bulun
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.serviceCard}>
                  <Text style={styles.serviceTitle}>📋 Geçmiş Kayıtlar</Text>
                  <Text style={styles.serviceDescription}>
                    Evcil hayvanınızın geçmiş tedavi kayıtlarını görün
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <Button
          title="Çıkış Yap"
          onPress={handleSignOut}
          style={styles.signOutButton}
          variant="secondary"
        />
      </ScrollView>

      <AppointmentModal
        visible={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onConfirm={handleAppointmentConfirm}
      />
      <AppointmentsModal
        visible={showAppointmentsModal}
        onClose={() => setShowAppointmentsModal(false)}
      />
      
    </SafeAreaView>
  );
};

