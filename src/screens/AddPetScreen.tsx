import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { petService } from '../services/petService';
import { CreatePetData } from '../types/pet';
import { styles } from '../styles/addPetScreenStyle';

interface AddPetScreenProps {
  onBack: () => void;
}

export const AddPetScreen: React.FC<AddPetScreenProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePetData>({
    name: '',
    type: 'dog',
    breed: '',
    age: 0,
    weight: 0,
    color: '',
    gender: 'male',
    microchipNumber: '',
    notes: '',
  });

  const handleInputChange = (field: keyof CreatePetData, value: string | number) => {
    console.log(`AddPetScreen: ${field} alanı güncelleniyor:`, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };
      console.log('AddPetScreen: Yeni form verisi:', newData);
      return newData;
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Hata', 'Evcil hayvan adı gereklidir');
      return false;
    }
    if (formData.age <= 0) {
      Alert.alert('Hata', 'Yaş 0\'dan büyük olmalıdır');
      return false;
    }
    if (formData.weight <= 0) {
      Alert.alert('Hata', 'Ağırlık 0\'dan büyük olmalıdır');
      return false;
    }
    if (!formData.color.trim()) {
      Alert.alert('Hata', 'Renk gereklidir');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    console.log('AddPetScreen: Form verisi gönderiliyor:', formData);
    
    setIsLoading(true);
    try {
      await petService.createPet(formData);
      console.log('AddPetScreen: Pet başarıyla kaydedildi');
      Alert.alert('Başarılı', 'Evcil hayvan başarıyla kaydedildi', [
        {
          text: 'Tamam',
          onPress: () => onBack(),
        },
      ]);
    } catch (error) {
      console.error('AddPetScreen: Pet kaydetme hatası:', error);
      Alert.alert('Hata', 'Evcil hayvan kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const petTypes: Array<{ label: string; value: 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'hamster' | 'other' }> = [
    { label: 'Köpek', value: 'dog' },
    { label: 'Kedi', value: 'cat' },
    { label: 'Kuş', value: 'bird' },
    { label: 'Balık', value: 'fish' },
    { label: 'Tavşan', value: 'rabbit' },
    { label: 'Hamster', value: 'hamster' },
    { label: 'Diğer', value: 'other' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Evcil Hayvan Ekle</Text>
            <Text style={styles.subtitle}>
              Evcil hayvanınızın bilgilerini girin
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Evcil Hayvan Adı *"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Örn: Max, Luna, Badem"
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Yaş *"
                  value={formData.age.toString()}
                  onChangeText={(value) => handleInputChange('age', parseInt(value) || 0)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Ağırlık (kg) *"
                  value={formData.weight.toString()}
                  onChangeText={(value) => handleInputChange('weight', parseFloat(value) || 0)}
                  placeholder="0.0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Input
              label="Renk *"
              value={formData.color}
              onChangeText={(value) => handleInputChange('color', value)}
              placeholder="Örn: Kahverengi, Beyaz, Siyah"
            />

            <Input
              label="Cins"
              value={formData.breed}
              onChangeText={(value) => handleInputChange('breed', value)}
              placeholder="Örn: Golden Retriever, British Shorthair"
            />

            <Input
              label="Mikroçip Numarası"
              value={formData.microchipNumber}
              onChangeText={(value) => handleInputChange('microchipNumber', value)}
              placeholder="Mikroçip numarası varsa girin"
            />

            <Input
              label="Notlar"
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Ek bilgiler, özel durumlar..."
              multiline
              numberOfLines={3}
            />

            <View style={styles.genderContainer}>
              <Text style={styles.label}>Cinsiyet *</Text>
              <View style={styles.genderButtons}>
                                  <Button
                    title="Erkek"
                    onPress={() => handleInputChange('gender', 'male')}
                    style={styles.genderButton}
                    variant={formData.gender === 'male' ? 'primary' : 'secondary'}
                  />
                  <Button
                    title="Dişi"
                    onPress={() => handleInputChange('gender', 'female')}
                    style={styles.genderButton}
                    variant={formData.gender === 'female' ? 'primary' : 'secondary'}
                  />
              </View>
            </View>

            <View style={styles.typeContainer}>
              <Text style={styles.label}>Hayvan Türü *</Text>
              <View style={styles.typeButtons}>
                {petTypes.map((type) => (
                  <Button
                    key={type.value}
                    title={type.label}
                    onPress={() => handleInputChange('type', type.value)}
                    style={styles.typeButton}
                    variant={formData.type === type.value ? 'primary' : 'secondary'}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="İptal"
              onPress={onBack}
              style={styles.cancelButton}
              variant="secondary"
            />
            <Button
              title="Kaydet"
              onPress={handleSubmit}
              style={styles.saveButton}
              loading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}; 