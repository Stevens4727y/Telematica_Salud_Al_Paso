import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  created_at: string;
  is_active: boolean;
}

export default function HealthTips() {
  const router = useRouter();
  const [tips, setTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Nutrición', 'Ejercicio', 'Descanso', 'Prevención', 'Bienestar Mental'];

  const categoryIcons = {
    'Nutrición': 'nutrition',
    'Ejercicio': 'fitness',
    'Descanso': 'bed',
    'Prevención': 'shield-checkmark',
    'Bienestar Mental': 'happy',
    'Todos': 'bulb',
  };

  useEffect(() => {
    fetchHealthTips();
  }, []);

  const fetchHealthTips = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/health-tips`);
      if (response.ok) {
        const data = await response.json();
        setTips(data);
      } else {
        console.error('Error fetching health tips');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHealthTips();
    setRefreshing(false);
  };

  const filteredTips = selectedCategory === 'Todos' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors = {
      'Nutrición': '#4CAF50',
      'Ejercicio': '#FF9800',
      'Descanso': '#9C27B0',
      'Prevención': '#2196F3',
      'Bienestar Mental': '#E91E63',
      'Todos': '#45B7D1',
    };
    return colors[category] || '#45B7D1';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#45B7D1" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💡 Consejos de Salud</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && {
                  backgroundColor: getCategoryColor(category),
                },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Ionicons
                name={categoryIcons[category] || 'bulb'}
                size={20}
                color={selectedCategory === category ? '#FFFFFF' : getCategoryColor(category)}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextSelected,
                  { color: selectedCategory === category ? '#FFFFFF' : getCategoryColor(category) },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tips List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#45B7D1" />
            <Text style={styles.loadingText}>Cargando consejos...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.tipsContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredTips.map((tip, index) => (
              <View key={tip.id} style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(tip.category) }]}>
                    <Ionicons
                      name={categoryIcons[tip.category] || 'bulb'}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.categoryBadgeText}>{tip.category}</Text>
                  </View>
                  <Text style={styles.tipNumber}>#{index + 1}</Text>
                </View>
                
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipContent}>{tip.content}</Text>
                
                <View style={styles.tipFooter}>
                  <View style={styles.tipInfo}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.tipInfoText}>Consejo verificado</Text>
                  </View>
                </View>
              </View>
            ))}

            {filteredTips.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={64} color="#CCC" />
                <Text style={styles.emptyTitle}>No hay consejos</Text>
                <Text style={styles.emptyText}>
                  No se encontraron consejos para la categoría "{selectedCategory}"
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Ionicons name="information-circle" size={16} color="#666" />
          <Text style={styles.footerText}>
            Consejos respaldados por profesionales de la salud - UNAN
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#45B7D1',
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
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: '#FFFFFF',
  },
  categoryText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextSelected: {
    fontWeight: '600',
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
  tipsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tipCard: {
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
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  tipNumber: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tipContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  tipFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  tipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipInfoText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
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
  footer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});