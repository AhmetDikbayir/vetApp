import React from 'react';
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
import { styles } from '../styles/homeScreenStyles';

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

 