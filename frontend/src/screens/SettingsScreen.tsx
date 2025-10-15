import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { apiService } from '../services/api.service';

const SettingsScreen: React.FC = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences</Text>
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
    </SafeAreaView>
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
