import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { notificationService } from '../models/NotificationService';
import { appointmentService } from '../services/appointmentService';
import { eventManager } from '../events/EventManager';
import { EVENT_NAMES } from '../events/NotificationEvents';
import { auth } from '../firebase';

export default function NotificationTestScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
    });

    // Event listener'ları ekle
    const notificationSentListener = eventManager.addEventListener(
      EVENT_NAMES.NOTIFICATION_SENT,
      (event) => {
        addLog(`📤 Bildirim gönderildi: ${event.success ? '✅' : '❌'} - ${event.appointmentId}`);
      }
    );

    const notificationReceivedListener = eventManager.addEventListener(
      EVENT_NAMES.NOTIFICATION_RECEIVED,
      (event) => {
        addLog(`📬 Bildirim alındı: ${event.title} - ${event.appointmentId}`);
      }
    );

    const notificationClickedListener = eventManager.addEventListener(
      EVENT_NAMES.NOTIFICATION_CLICKED,
      (event) => {
        addLog(`👆 Bildirim tıklandı: ${event.title} - ${event.appointmentId}`);
      }
    );

    return () => {
      unsubscribe();
      notificationSentListener.remove();
      notificationReceivedListener.remove();
      notificationClickedListener.remove();
    };
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  const initializeOneSignal = async () => {
    try {
      addLog('🔄 OneSignal başlatılıyor...');
      await notificationService.initialize();
      addLog('✅ OneSignal başlatıldı');
    } catch (error) {
      addLog(`❌ OneSignal başlatılamadı: ${error}`);
    }
  };

  const setUserId = async () => {
    if (!user) {
      addLog('❌ Kullanıcı giriş yapmamış');
      return;
    }

    try {
      addLog(`🔄 Kullanıcı ID set ediliyor: ${user.uid}`);
      await notificationService.setUserId(user.uid);
      addLog('✅ Kullanıcı ID set edildi');
    } catch (error) {
      addLog(`❌ Kullanıcı ID set edilemedi: ${error}`);
    }
  };

  const getPlayerId = async () => {
    try {
      addLog('🔄 Player ID alınıyor...');
      const playerId = await notificationService.getPlayerId();
      if (playerId) {
        addLog(`✅ Player ID: ${playerId}`);
        Alert.alert('Player ID', playerId);
      } else {
        addLog('❌ Player ID alınamadı');
      }
    } catch (error) {
      addLog(`❌ Player ID alınamadı: ${error}`);
    }
  };

  const savePlayerId = async () => {
    if (!user) {
      addLog('❌ Kullanıcı giriş yapmamış');
      return;
    }

    try {
      addLog('🔄 Player ID alınıyor...');
      const playerId = await notificationService.getPlayerId();
      if (playerId) {
        addLog('🔄 Player ID kaydediliyor...');
        await notificationService.savePlayerId(user.uid, playerId);
        addLog('✅ Player ID kaydedildi');
      } else {
        addLog('❌ Player ID alınamadı');
      }
    } catch (error) {
      addLog(`❌ Player ID kaydedilemedi: ${error}`);
    }
  };

  const createTestAppointment = async () => {
    if (!user) {
      addLog('❌ Kullanıcı giriş yapmamış');
      return;
    }

    try {
      addLog('🔄 Test randevusu oluşturuluyor...');
      
      // Test veteriner ID'si (gerçek uygulamada bu dinamik olacak)
      const testVeterinarianId = 'test-veterinarian-id';
      
      const appointmentData = {
        petId: 'test-pet-id',
        petName: 'Test Köpek',
        ownerId: user.uid,
        ownerName: user.displayName || 'Test Kullanıcı',
        veterinarianId: testVeterinarianId,
        veterinarianName: 'Test Veteriner',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        status: 'pending' as const,
        notes: 'Test randevusu'
      };

      const appointmentId = await appointmentService.createAppointment(appointmentData);
      addLog(`✅ Test randevusu oluşturuldu: ${appointmentId}`);
      
    } catch (error) {
      addLog(`❌ Test randevusu oluşturulamadı: ${error}`);
    }
  };

  const checkPermission = async () => {
    try {
      addLog('🔄 Bildirim izni kontrol ediliyor...');
      const hasPermission = await notificationService.checkNotificationPermission();
      addLog(`📱 Bildirim izni: ${hasPermission ? '✅ Var' : '❌ Yok'}`);
    } catch (error) {
      addLog(`❌ İzin kontrol edilemedi: ${error}`);
    }
  };

  const requestPermission = async () => {
    try {
      addLog('🔄 Bildirim izni isteniyor...');
      const granted = await notificationService.requestNotificationPermission();
      addLog(`📱 Bildirim izni: ${granted ? '✅ Verildi' : '❌ Reddedildi'}`);
    } catch (error) {
      addLog(`❌ İzin istenemedi: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OneSignal Test Ekranı</Text>
      
      <ScrollView style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={initializeOneSignal}>
          <Text style={styles.buttonText}>OneSignal Başlat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={setUserId}>
          <Text style={styles.buttonText}>Kullanıcı ID Set Et</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={getPlayerId}>
          <Text style={styles.buttonText}>Player ID Al</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={savePlayerId}>
          <Text style={styles.buttonText}>Player ID Kaydet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={checkPermission}>
          <Text style={styles.buttonText}>İzin Kontrol Et</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>İzin İste</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.testButton]} onPress={createTestAppointment}>
          <Text style={styles.buttonText}>Test Randevusu Oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>Logları Temizle</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Loglar:</Text>
        <ScrollView style={styles.logs}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2C3E50',
  },
  buttonContainer: {
    flex: 1,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#E74C3C',
  },
  clearButton: {
    backgroundColor: '#95A5A6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#2C3E50',
    borderRadius: 8,
    padding: 10,
  },
  logTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logs: {
    flex: 1,
  },
  logText: {
    color: '#BDC3C7',
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
}); 