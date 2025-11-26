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
import { Colors, BorderRadius, Shadows, Spacing } from '../theme';

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
          <Text style={styles.title}>PantryPartner</Text>
          <Text style={styles.subtitle}>Your friendly kitchen companion</Text>
        </View>

        {/* Smart Expiration Notifications */}
        {loadingNotifications ? (
          <View style={styles.notificationsLoading}>
            <ActivityIndicator size="small" color={Colors.primary} />
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
            style={[styles.actionButton, styles.actionButtonAccent]}
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
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.card,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  actionsContainer: {
    padding: Spacing.lg,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  actionButtonAccent: {
    backgroundColor: Colors.accent,
  },
  actionButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.notificationToday,
    margin: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
  },
  recentItemsContainer: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  itemExpiry: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  // Notification styles
  notificationsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.notificationInfo,
    borderRadius: BorderRadius.md,
  },
  loadingNotificationsText: {
    marginLeft: Spacing.md,
    fontSize: 14,
    color: Colors.primary,
  },
  notificationsContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  notificationCard: {
    backgroundColor: Colors.notificationWarning,
    padding: 15,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    ...Shadows.small,
  },
  notificationToday: {
    backgroundColor: Colors.notificationToday,
    borderLeftColor: Colors.error,
  },
  notificationTomorrow: {
    backgroundColor: Colors.notificationTomorrow,
    borderLeftColor: Colors.expiringUrgent,
  },
  notificationUrgent: {
    backgroundColor: Colors.notificationWarning,
    borderLeftColor: Colors.warning,
  },
  notificationMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  notificationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationBrand: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  notificationQuantity: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default HomeScreen;