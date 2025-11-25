import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { fetchPantryItems, fetchExpiringItems, fetchExpiredItems } from '../store/pantrySlice';
import apiService from '../services/api.service';

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, expiringItems, expiredItems, loading, error } = useSelector(
    (state: RootState) => state.pantry
  );

  // State for smart expiration notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const response = await apiService.getExpiringNotifications();
      if (response.success) {
        setNotifications(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    // Load initial data when component mounts
    dispatch(fetchPantryItems({}));
    dispatch(fetchExpiringItems(7));
    dispatch(fetchExpiredItems());
    fetchNotifications();
  }, [dispatch, fetchNotifications]);

  // Refresh notifications every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      dispatch(fetchPantryItems({}));
      dispatch(fetchExpiringItems(7));
      dispatch(fetchExpiredItems());
    }, [dispatch, fetchNotifications])
  );

  const handleRefresh = () => {
    dispatch(fetchPantryItems({}));
    dispatch(fetchExpiringItems(7));
    dispatch(fetchExpiredItems());
    fetchNotifications();
  };

  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Pantry Manager</Text>
          <Text style={styles.subtitle}>Keep track of your food inventory</Text>
        </View>

        {/* Smart Expiration Notifications */}
        {loadingNotifications ? (
          <View style={styles.notificationsLoading}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingNotificationsText}>Checking expiration alerts...</Text>
          </View>
        ) : notifications.length > 0 ? (
          <View style={styles.notificationsContainer}>
            <Text style={styles.notificationsTitle}>
              ⚠️ Expiration Alerts ({notifications.length})
            </Text>
            {notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notificationCard,
                  item.urgency === 'today' && styles.notificationToday,
                  item.urgency === 'tomorrow' && styles.notificationTomorrow,
                  item.urgency === 'urgent' && styles.notificationUrgent,
                ]}
                onPress={() => navigation.navigate('Pantry')}
              >
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <View style={styles.notificationDetails}>
                  <Text style={styles.notificationBrand}>{item.brand || item.name}</Text>
                  <Text style={styles.notificationQuantity}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{items.length}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{expiringItems.length}</Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{expiredItems.length}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}
            onPress={() => navigation.navigate('Cookbook')}
          >
            <Text style={styles.actionButtonText}>My Cookbook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#34C759', marginTop: 10 }]}
            onPress={() => navigation.navigate('GenerateRecipe')}
          >
            <Text style={styles.actionButtonText}>Generate Recipe</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        <View style={styles.recentItemsContainer}>
          <Text style={styles.sectionTitle}>Recent Items</Text>
          {items.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetails}>
                {item.quantity} {item.unit} • {item.category}
              </Text>
              <Text style={styles.itemExpiry}>
                Expires: {new Date(item.expirationDate).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    margin: 20,
    borderRadius: 10,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  recentItemsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  itemExpiry: {
    fontSize: 12,
    color: '#999',
  },
  // Notification styles
  notificationsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
  },
  loadingNotificationsText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#007AFF',
  },
  notificationsContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  notificationCard: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationToday: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
  },
  notificationTomorrow: {
    backgroundColor: '#fff3e0',
    borderLeftColor: '#ff9800',
  },
  notificationUrgent: {
    backgroundColor: '#fff9e0',
    borderLeftColor: '#ffc107',
  },
  notificationMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notificationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationBrand: {
    fontSize: 13,
    color: '#666',
  },
  notificationQuantity: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
});

export default HomeScreen;