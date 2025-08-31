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

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: string;
  notes?: string;
  created_at: string;
}

export default function Appointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    doctor_name: '',
    specialty: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
  });

  const specialties = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Pediatría',
    'Neurología',
    'Ortopedia',
    'Psiquiatría',
    'Oftalmología',
    'Otorrinolaringología',
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/appointments`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!formData.patient_name || !formData.patient_phone || !formData.doctor_name || 
        !formData.specialty || !formData.appointment_date || !formData.appointment_time || !formData.reason) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments([...appointments, newAppointment]);
        resetForm();
        setModalVisible(false);
        Alert.alert('Éxito', 'Cita médica creada exitosamente.');
      } else {
        Alert.alert('Error', 'No se pudo crear la cita médica.');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/appointments/${editingAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedAppointment = await response.json();
        setAppointments(appointments.map(apt => 
          apt.id === editingAppointment.id ? updatedAppointment : apt
        ));
        resetForm();
        setModalVisible(false);
        setEditingAppointment(null);
        Alert.alert('Éxito', 'Cita médica actualizada exitosamente.');
      } else {
        Alert.alert('Error', 'No se pudo actualizar la cita médica.');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que deseas eliminar esta cita médica?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                setAppointments(appointments.filter(apt => apt.id !== appointmentId));
                Alert.alert('Éxito', 'Cita médica eliminada exitosamente.');
              } else {
                Alert.alert('Error', 'No se pudo eliminar la cita médica.');
              }
            } catch (error) {
              console.error('Error deleting appointment:', error);
              Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      patient_name: '',
      patient_phone: '',
      doctor_name: '',
      specialty: '',
      appointment_date: '',
      appointment_time: '',
      reason: '',
    });
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_name: appointment.patient_name,
      patient_phone: appointment.patient_phone,
      doctor_name: appointment.doctor_name,
      specialty: appointment.specialty,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      reason: appointment.reason,
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingAppointment(null);
    resetForm();
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': '#FF9800',
      'confirmed': '#4CAF50',
      'completed': '#2196F3',
      'cancelled': '#F44336',
    };
    return colors[status] || '#FF9800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'scheduled': 'Programada',
      'confirmed': 'Confirmada',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
    };
    return texts[status] || 'Programada';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📅 Citas Médicas</Text>
        <TouchableOpacity onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Cargando citas...</Text>
          </View>
        ) : (
          <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
            {appointments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="#CCC" />
                <Text style={styles.emptyTitle}>No hay citas programadas</Text>
                <Text style={styles.emptyText}>Toca el botón + para crear tu primera cita médica</Text>
              </View>
            ) : (
              appointments.map((appointment) => (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{appointment.patient_name}</Text>
                      <Text style={styles.patientPhone}>{appointment.patient_phone}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
                    </View>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="person" size={16} color="#666" />
                      <Text style={styles.detailText}>Dr. {appointment.doctor_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="medical" size={16} color="#666" />
                      <Text style={styles.detailText}>{appointment.specialty}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar" size={16} color="#666" />
                      <Text style={styles.detailText}>{appointment.appointment_date} - {appointment.appointment_time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text" size={16} color="#666" />
                      <Text style={styles.detailText}>{appointment.reason}</Text>
                    </View>
                  </View>

                  <View style={styles.appointmentActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => openEditModal(appointment)}
                    >
                      <Ionicons name="create-outline" size={16} color="#4ECDC4" />
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteAppointment(appointment.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#F44336" />
                      <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>

      {/* Create/Edit Modal */}
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
              <Text style={styles.modalTitle}>
                {editingAppointment ? 'Editar Cita' : 'Nueva Cita Médica'}
              </Text>
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
                <Text style={styles.label}>Teléfono</Text>
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
                <Text style={styles.label}>Nombre del Doctor</Text>
                <TextInput
                  style={styles.input}
                  value={formData.doctor_name}
                  onChangeText={(text) => setFormData({ ...formData, doctor_name: text })}
                  placeholder="Nombre del doctor"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Especialidad</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                  {specialties.map((specialty) => (
                    <TouchableOpacity
                      key={specialty}
                      style={[
                        styles.optionButton,
                        formData.specialty === specialty && styles.optionButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, specialty })}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          formData.specialty === specialty && styles.optionButtonTextSelected,
                        ]}
                      >
                        {specialty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha de la Cita</Text>
                <TextInput
                  style={styles.input}
                  value={formData.appointment_date}
                  onChangeText={(text) => setFormData({ ...formData, appointment_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hora</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                  {timeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeButton,
                        formData.appointment_time === time && styles.timeButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, appointment_time: time })}
                    >
                      <Text
                        style={[
                          styles.timeButtonText,
                          formData.appointment_time === time && styles.timeButtonTextSelected,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Motivo de la Consulta</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.reason}
                  onChangeText={(text) => setFormData({ ...formData, reason: text })}
                  placeholder="Describe el motivo de la consulta..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
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
                onPress={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}
              >
                <Text style={styles.saveButtonText}>
                  {editingAppointment ? 'Actualizar' : 'Crear Cita'}
                </Text>
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
    backgroundColor: '#4ECDC4',
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
  appointmentsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  appointmentCard: {
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
  appointmentHeader: {
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
  patientPhone: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#E8F8F7',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  editButtonText: {
    marginLeft: 5,
    color: '#4ECDC4',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButtonText: {
    marginLeft: 5,
    color: '#F44336',
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
    height: 80,
  },
  optionsContainer: {
    marginTop: 5,
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  timeButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeButtonTextSelected: {
    color: '#FFFFFF',
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
    backgroundColor: '#4ECDC4',
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