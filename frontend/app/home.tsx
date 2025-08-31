import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Emergencia',
      subtitle: 'Asistencia médica inmediata',
      icon: 'medical' as keyof typeof Ionicons.glyphMap,
      color: '#FF6B6B',
      route: '/emergency',
    },
    {
      title: 'Citas Médicas',
      subtitle: 'Programar y gestionar citas',
      icon: 'calendar' as keyof typeof Ionicons.glyphMap,
      color: '#4ECDC4',
      route: '/appointments',
    },
    {
      title: 'Consejos de Salud',
      subtitle: 'Tips y recomendaciones',
      icon: 'bulb' as keyof typeof Ionicons.glyphMap,
      color: '#45B7D1',
      route: '/health-tips',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Salud al Paso</Text>
        <Text style={styles.headerSubtitle}>UNAN - Bienvenido/a</Text>
      </View>

      {/* Menu Buttons */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuButton, { backgroundColor: item.color }]}
            onPress={() => router.push(item.route)}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={48} color="#FFFFFF" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Additional Menu Item for Consultas */}
      <TouchableOpacity
        style={[styles.consultationButton]}
        onPress={() => router.push('/consultations')}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubbles" size={24} color="#2E8B57" />
        <Text style={styles.consultationText}>Consultas Médicas</Text>
        <Ionicons name="chevron-forward" size={20} color="#2E8B57" />
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Universidad Nacional Autónoma de Nicaragua</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '300',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 100,
  },
  iconContainer: {
    marginRight: 20,
    width: 60,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '300',
  },
  consultationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#2E8B57',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#2E8B57',
    marginLeft: 15,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    fontWeight: '300',
  },
});