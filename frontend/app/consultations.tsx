import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Consultation {
  id: string;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  consultation_type: string;
  symptoms: string;
  consultation_date: string;
  status: string;
  diagnosis?: string;
  treatment?: string;
  follow_up_date?: string;
}

export default function Consultations() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    doctor_name: '',
    consultation_type: '',
    symptoms: '',
  });

  const consultationTypes = ['Virtual', 'Presencial'];
  const doctors = [
    'Dr. María González - Medicina General',
    'Dr. Carlos López - Cardiología', 
    'Dra. Ana Martínez - Dermatología',
    'Dr. José Hernández - Pediatría',
    'Dra. Laura Rodríguez - Ginecología',
    'Dr. Roberto Silva - Neurología',
    'Dra. Carmen Díaz - Psiquiatría',
    'Dr. Fernando Torres - Ortopedia',
  ];

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/consultations`);
      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConsultation = async () => {
    if (!formData.patient_name || !formData.patient_phone || !formData.doctor_name || 
        !formData.consultation_type || !formData.symptoms) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/consultations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newConsultation = await response.json();
        setConsultations([newConsultation, ...consultations]);
        resetForm();
        setModalVisible(false);
        Alert.alert('Éxito', 'Consulta médica solicitada exitosamente.');
      } else {
        Alert.alert('Error', 'No se pudo crear la consulta médica.');
      }
    } catch (error) {
      console.error('Error creating consultation:', error);
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    }
  };

  const resetForm = () => {
    setFormData({
      patient_name: '',
      patient_phone: '',
      doctor_name: '',
      consultation_type: '',
      symptoms: '',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': '#FF9800',
      'in_progress': '#2196F3',
      'completed': '#4CAF50',
    };
    return colors[status] || '#FF9800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'pending': 'Pendiente',
      'in_progress': 'En Proceso',
      'completed': 'Completada',
    };
    return texts[status] || 'Pendiente';
  };

  const getTypeIcon = (type: string) => {
    return type === 'Virtual' ? 'videocam' : 'person';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💬 Consultas Médicas</Text>
        <TouchableOpacity onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#2E8B57" />
          <Text style={styles.infoText}>
            Solicita consultas médicas virtuales o presenciales con nuestros especialistas
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E8B57" />
            <Text style={styles.loadingText}>Cargando consultas...</Text>
          </View>
        ) : (
          <ScrollView style={styles.consultationsList} showsVerticalScrollIndicator={false}>
            {consultations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
                <Text style={styles.emptyTitle}>No hay consultas registradas</Text>
                <Text style={styles.emptyText}>Toca el botón + para solicitar tu primera consulta médica</Text>
              </View>
            ) : (
              consultations.map((consultation) => (
                <View key={consultation.id} style={styles.consultationCard}>
                  <View style={styles.consultationHeader}>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{consultation.patient_name}</Text>
                      <Text style={styles.consultationDate}>
                        {formatDate(consultation.consultation_date)}
                      </Text>
                    </View>
                    <View style={styles.badgeContainer}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(consultation.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(consultation.status)}</Text>
                      </View>
                      <View style={styles.typeBadge}>
                        <Ionicons name={getTypeIcon(consultation.consultation_type)} size={14} color="#666" />
                        <Text style={styles.typeText}>{consultation.consultation_type}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.consultationDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="person" size={16} color="#666" />
                      <Text style={styles.detailText}>{consultation.doctor_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="call" size={16} color="#666" />
                      <Text style={styles.detailText}>{consultation.patient_phone}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="medical" size={16} color="#666" />
                      <Text style={styles.detailText}>Síntomas: {consultation.symptoms}</Text>
                    </View>
                    
                    {consultation.diagnosis && (
                      <View style={styles.detailRow}>
                        <Ionicons name="document-text" size={16} color="#4CAF50" />
                        <Text style={[styles.detailText, { color: '#4CAF50', fontWeight: '500' }]}>
                          Diagnóstico: {consultation.diagnosis}
                        </Text>
                      </View>
                    )}
                    
                    {consultation.treatment && (
                      <View style={styles.detailRow}>
                        <Ionicons name="medical" size={16} color="#2196F3" />
                        <Text style={[styles.detailText, { color: '#2196F3', fontWeight: '500' }]}>
                          Tratamiento: {consultation.treatment}
                        </Text>
                      </View>
                    )}
                  </View>

                  {consultation.consultation_type === 'Virtual' && consultation.status === 'pending' && (
                    <View style={styles.virtualActions}>
                      <TouchableOpacity style={styles.joinButton}>
                        <Ionicons name="videocam" size={16} color="#FFFFFF" />
                        <Text style={styles.joinButtonText}>Unirse a la consulta</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>

      {/* Create Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Consulta Médica</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del Paciente</Text>
                <TextInput
                  style={styles.input}
                  value={formData.patient_name}
                  onChangeText={(text) => setFormData({ ...formData, patient_name: text })}
                  placeholder="Nombre completo del paciente"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono de Contacto</Text>
                <TextInput
                  style={styles.input}
                  value={formData.patient_phone}
                  onChangeText={(text) => setFormData({ ...formData, patient_phone: text })}
                  placeholder="Número de teléfono"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Consulta</Text>
                <View style={styles.typeSelector}>
                  {consultationTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        formData.consultation_type === type && styles.typeButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, consultation_type: type })}
                    >
                      <Ionicons 
                        name={getTypeIcon(type)} 
                        size={20} 
                        color={formData.consultation_type === type ? '#FFFFFF' : '#666'} 
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.consultation_type === type && styles.typeButtonTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Seleccionar Doctor</Text>
                <ScrollView style={styles.doctorsContainer} nestedScrollEnabled={true}>
                  {doctors.map((doctor) => (
                    <TouchableOpacity
                      key={doctor}
                      style={[
                        styles.doctorButton,
                        formData.doctor_name === doctor && styles.doctorButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, doctor_name: doctor })}
                    >
                      <View style={styles.doctorInfo}>
                        <Ionicons name="person-circle" size={24} color="#666" />
                        <Text
                          style={[
                            styles.doctorButtonText,
                            formData.doctor_name === doctor && styles.doctorButtonTextSelected,
                          ]}
                        >
                          {doctor}
                        </Text>
                      </View>
                      {formData.doctor_name === doctor && (
                        <Ionicons name="checkmark-circle" size={20} color="#2E8B57" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Síntomas y Motivo de Consulta</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.symptoms}
                  onChangeText={(text) => setFormData({ ...formData, symptoms: text })}
                  placeholder="Describe tus síntomas y el motivo de la consulta..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateConsultation}
              >
                <Text style={styles.saveButtonText}>Solicitar Consulta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E8B57',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  infoBanner: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#2E8B57',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  consultationsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  consultationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  consultationDate: {
    fontSize: 12,
    color: '#999',
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 5,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  typeText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  consultationDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  virtualActions: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  joinButton: {
    backgroundColor: '#2E8B57',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  joinButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 15,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: '#FFFFFF',
  },
  typeButtonSelected: {
    backgroundColor: '#2E8B57',
    borderColor: '#2E8B57',
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: '#FFFFFF',
  },
  doctorsContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },
  doctorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  doctorButtonSelected: {
    backgroundColor: '#E8F5E8',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorButtonText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  doctorButtonTextSelected: {
    color: '#2E8B57',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#2E8B57',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});