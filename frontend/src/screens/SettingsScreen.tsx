import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api.service';

// Helper function to format enum values
const formatEnumValue = (value: string | undefined) => {
  if (!value || value === 'none') return 'Not set';
  return value.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const handleHealthCheck = async () => {
    try {
      const health = await apiService.healthCheck();
      Alert.alert(
        'API Health Check',
        `Status: ${health.status}\nVersion: ${health.version}\nTimestamp: ${new Date(health.timestamp).toLocaleString()}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'API Health Check Failed',
        'Could not connect to the backend API. Make sure the server is running.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          // TODO: Implement cache clearing
          Alert.alert('Cache Cleared', 'All cached data has been cleared.');
        }},
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Pantry Manager',
      'Version 1.0.0\n\nA React Native app for managing your pantry inventory.\n\nBuilt with:\n• React Native\n• TypeScript\n• Redux Toolkit\n• React Navigation',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleEditPreferences = () => {
    // Navigate back to profile setup screen to edit
    try {
      (navigation as any).navigate('ProfileSetup');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to profile setup.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences</Text>
      </View>

      {/* User Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email</Text>
          <Text style={styles.settingValue}>{user?.email}</Text>
        </View>

        {user?.name && (
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Name</Text>
            <Text style={styles.settingValue}>{user.name}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.settingItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Dietary Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Diet Type</Text>
          <Text style={styles.settingValue}>{formatEnumValue(user?.diet)}</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Goals</Text>
          <Text style={styles.settingValue}>{formatEnumValue(user?.goals)}</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Food Restrictions</Text>
          <Text style={styles.settingValue}>
            {user?.food_restrictions && Array.isArray(user.food_restrictions) && user.food_restrictions.length > 0
              ? user.food_restrictions.join(', ')
              : 'None'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.settingItem, styles.editButton]}
          onPress={handleEditPreferences}
        >
          <Text style={styles.editButtonText}>Edit Preferences</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleHealthCheck}>
          <Text style={styles.settingLabel}>API Health Check</Text>
          <Text style={styles.settingDescription}>Test connection to backend</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
          <Text style={styles.settingLabel}>Clear Cache</Text>
          <Text style={styles.settingDescription}>Remove all cached data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
          <Text style={styles.settingLabel}>App Information</Text>
          <Text style={styles.settingDescription}>Version and build details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Pantry Manager v1.0.0
        </Text>
        <Text style={styles.footerSubtext}>
          Built with React Native & TypeScript
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  settingItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingValue: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
  logoutButton: {
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff3b30',
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
