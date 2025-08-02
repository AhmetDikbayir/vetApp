import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';

interface HomeScreenProps {
  onNavigateToAddPet: () => void;
  onNavigateToProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToAddPet, onNavigateToProfile }) => {
  const { user, signOut } = useAuth();

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
            <Text style={styles.sectionTitle}>VetApp Hizmetleri</Text>
            
            <TouchableOpacity style={styles.serviceCard} onPress={handleAddPet}>
              <Text style={styles.serviceTitle}>🐾 Evcil Hayvanımı Kaydet</Text>
              <Text style={styles.serviceDescription}>
                Evcil hayvanınızın bilgilerini ekleyin ve takip edin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>📅 Randevu Al</Text>
              <Text style={styles.serviceDescription}>
                Veteriner hekiminizle randevu oluşturun
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
          </View>
        </View>

        <Button
          title="Çıkış Yap"
          onPress={handleSignOut}
          style={styles.signOutButton}
          variant="secondary"
        />
      </ScrollView>
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    fontSize: 24,
  },
  userName: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  userInfo: {
    marginBottom: 32,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  userInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  userInfoValue: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  signOutButton: {
    marginTop: 16,
  },
}); 