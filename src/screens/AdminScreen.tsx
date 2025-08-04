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
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { clinicService } from '../services/clinicService';
import { veterinarianService } from '../services/veterinarianService';
import { Clinic } from '../types/clinic';
import { Veterinarian } from '../types/veterinarian';

interface AdminScreenProps {
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddClinicModal, setShowAddClinicModal] = useState(false);
  const [showAddVetModal, setShowAddVetModal] = useState(false);
  
  const [clinicForm, setClinicForm] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Türkiye',
    },
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
  });
  
  const [vetForm, setVetForm] = useState({
    name: '',
    specialization: [] as string[],
    clinicId: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clinicsData, vetsData] = await Promise.all([
        clinicService.getClinics(),
        veterinarianService.getVeterinarians(),
      ]);
      setClinics(clinicsData);
      setVeterinarians(vetsData);
    } catch (error) {
      console.error('Admin: Veri yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClinic = async () => {
    if (!clinicForm.name || !clinicForm.address || !clinicForm.phone) {
      Alert.alert('Hata', 'Lütfen gerekli alanları doldurun');
      return;
    }

    setIsLoading(true);
    try {
      const newClinic = await clinicService.createClinic({
        name: clinicForm.name,
        address: clinicForm.address,
        phone: clinicForm.phone,
        email: clinicForm.email,
        location: {
          latitude: parseFloat(clinicForm.latitude) || 0,
          longitude: parseFloat(clinicForm.longitude) || 0,
        },
        services: [],
        description: '',
        facilities: [],
        emergencyService: false,
        isOpen24Hours: false,
      });

      setClinics([...clinics, newClinic]);
      setShowAddClinicModal(false);
      setClinicForm({ name: '', address: { street: '', city: '', state: '', zipCode: '', country: 'Türkiye' }, phone: '', email: '', latitude: '', longitude: '' });
      Alert.alert('Başarılı', 'Klinik başarıyla eklendi');
    } catch (error) {
      console.error('Admin: Klinik ekleme hatası:', error);
      Alert.alert('Hata', 'Klinik eklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVeterinarian = async () => {
    if (!vetForm.name || !vetForm.specialization || !vetForm.clinicId) {
      Alert.alert('Hata', 'Lütfen gerekli alanları doldurun');
      return;
    }

    setIsLoading(true);
    try {
      const newVet = await veterinarianService.createVeterinarian({
        name: vetForm.name,
        specialization: vetForm.specialization,
        clinicId: vetForm.clinicId,
        phone: vetForm.phone,
        email: vetForm.email,
        experience: 0,
        education: '',
        licenseNumber: '',
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

      setVeterinarians([...veterinarians, newVet]);
      setShowAddVetModal(false);
      setVetForm({ name: '', specialization: [], clinicId: '', phone: '', email: '' });
      Alert.alert('Başarılı', 'Veteriner başarıyla eklendi');
    } catch (error) {
      console.error('Admin: Veteriner ekleme hatası:', error);
      Alert.alert('Hata', 'Veteriner eklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Paneli</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Admin Actions */}
        <View style={styles.adminActions}>
          <Button
            title="Klinik Ekle"
            onPress={() => setShowAddClinicModal(true)}
            style={styles.actionButton}
          />
          <Button
            title="Veteriner Ekle"
            onPress={() => setShowAddVetModal(true)}
            style={styles.actionButton}
          />
          <Button
            title="Verileri Yenile"
            onPress={loadData}
            style={styles.actionButton}
            variant="secondary"
          />
        </View>

        {/* Clinics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Klinikler ({clinics.length})</Text>
          {clinics.map((clinic) => (
            <View key={clinic.id} style={styles.itemCard}>
              <Text style={styles.itemName}>{clinic.name}</Text>
              <Text style={styles.itemDetail}>{`${clinic.address.street}, ${clinic.address.city}`}</Text>
              <Text style={styles.itemDetail}>{clinic.phone}</Text>
              <Text style={styles.itemDetail}>Rating: {clinic.rating}/5</Text>
            </View>
          ))}
          {clinics.length === 0 && (
            <Text style={styles.emptyText}>Henüz klinik eklenmemiş</Text>
          )}
        </View>

        {/* Veterinarians Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veterinerler ({veterinarians.length})</Text>
          {veterinarians.map((vet) => (
            <View key={vet.id} style={styles.itemCard}>
              <Text style={styles.itemName}>{vet.name}</Text>
              <Text style={styles.itemDetail}>
                {Array.isArray(vet.specialization) 
                  ? vet.specialization.join(', ') 
                  : vet.specialization || 'Uzmanlık belirtilmemiş'}
              </Text>
              <Text style={styles.itemDetail}>{vet.phone}</Text>
              <Text style={styles.itemDetail}>Rating: {vet.rating}/5</Text>
            </View>
          ))}
          {veterinarians.length === 0 && (
            <Text style={styles.emptyText}>Henüz veteriner eklenmemiş</Text>
          )}
        </View>
      </ScrollView>

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
              <Text style={styles.modalTitle}>Klinik Ekle</Text>
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
                value={clinicForm.name}
                onChangeText={(text) => setClinicForm({ ...clinicForm, name: text })}
                placeholder="Klinik adını girin"
              />
              <Input
                label="Sokak Adresi"
                value={clinicForm.address.street}
                onChangeText={(text) => setClinicForm({ 
                  ...clinicForm, 
                  address: { ...clinicForm.address, street: text } 
                })}
                placeholder="Sokak adresini girin"
              />
              <Input
                label="Şehir"
                value={clinicForm.address.city}
                onChangeText={(text) => setClinicForm({ 
                  ...clinicForm, 
                  address: { ...clinicForm.address, city: text } 
                })}
                placeholder="Şehir adını girin"
              />
              <Input
                label="İl"
                value={clinicForm.address.state}
                onChangeText={(text) => setClinicForm({ 
                  ...clinicForm, 
                  address: { ...clinicForm.address, state: text } 
                })}
                placeholder="İl adını girin"
              />
              <Input
                label="Posta Kodu"
                value={clinicForm.address.zipCode}
                onChangeText={(text) => setClinicForm({ 
                  ...clinicForm, 
                  address: { ...clinicForm.address, zipCode: text } 
                })}
                placeholder="Posta kodunu girin"
              />
              <Input
                label="Telefon"
                value={clinicForm.phone}
                onChangeText={(text) => setClinicForm({ ...clinicForm, phone: text })}
                placeholder="Telefon numarasını girin"
                keyboardType="phone-pad"
              />
              <Input
                label="E-posta"
                value={clinicForm.email}
                onChangeText={(text) => setClinicForm({ ...clinicForm, email: text })}
                placeholder="E-posta adresini girin"
                keyboardType="email-address"
              />
              <Input
                label="Enlem"
                value={clinicForm.latitude}
                onChangeText={(text) => setClinicForm({ ...clinicForm, latitude: text })}
                placeholder="Enlem (örn: 41.0082)"
                keyboardType="numeric"
              />
              <Input
                label="Boylam"
                value={clinicForm.longitude}
                onChangeText={(text) => setClinicForm({ ...clinicForm, longitude: text })}
                placeholder="Boylam (örn: 28.9784)"
                keyboardType="numeric"
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
                  loading={isLoading}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Veterinarian Modal */}
      <Modal
        visible={showAddVetModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddVetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Veteriner Ekle</Text>
              <TouchableOpacity
                onPress={() => setShowAddVetModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Veteriner Adı"
                value={vetForm.name}
                onChangeText={(text) => setVetForm({ ...vetForm, name: text })}
                placeholder="Veteriner adını girin"
              />
              <Input
                label="Uzmanlık"
                value={vetForm.specialization.join(', ')}
                onChangeText={(text) => setVetForm({ 
                  ...vetForm, 
                  specialization: text.split(',').map(s => s.trim()).filter(s => s.length > 0) 
                })}
                placeholder="Uzmanlık alanlarını virgülle ayırarak girin"
              />
              <Input
                label="Klinik ID"
                value={vetForm.clinicId}
                onChangeText={(text) => setVetForm({ ...vetForm, clinicId: text })}
                placeholder="Klinik ID'sini girin"
              />
              <Input
                label="Telefon"
                value={vetForm.phone}
                onChangeText={(text) => setVetForm({ ...vetForm, phone: text })}
                placeholder="Telefon numarasını girin"
                keyboardType="phone-pad"
              />
              <Input
                label="E-posta"
                value={vetForm.email}
                onChangeText={(text) => setVetForm({ ...vetForm, email: text })}
                placeholder="E-posta adresini girin"
                keyboardType="email-address"
              />

              <View style={styles.modalButtons}>
                <Button
                  title="İptal"
                  onPress={() => setShowAddVetModal(false)}
                  style={styles.cancelButton}
                  variant="secondary"
                />
                <Button
                  title="Ekle"
                  onPress={handleAddVeterinarian}
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
  adminActions: {
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
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