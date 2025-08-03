import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F9FA',
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1A1A1A',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#666666',
      textAlign: 'center',
    },
    form: {
      marginBottom: 32,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    halfWidth: {
      flex: 1,
    },
    genderContainer: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1A1A1A',
      marginBottom: 8,
    },
    genderButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    genderButton: {
      flex: 1,
    },
    typeContainer: {
      marginBottom: 24,
    },
    typeButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    typeButton: {
      minWidth: 80,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
    },
    saveButton: {
      flex: 2,
    },
  });