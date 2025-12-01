import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import PantryScreen from '../screens/PantryScreen';
import AddItemScreen from '../screens/AddItemScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import EditItemScreen from '../screens/EditItemScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GenerateRecipeScreen from '../screens/GenerateRecipeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import CookbookScreen from "../screens/CookBookScreen";

// Define navigation types
export type RootTabParamList = {
  Home: undefined;
  Pantry: undefined;
  Settings: undefined;
};

export type PantryStackParamList = {
  PantryList: undefined;
  AddItem: undefined;
  ItemDetail: { itemId: string };
  EditItem: { itemId: string };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator();
const PantryStack = createStackNavigator<PantryStackParamList>();
const HomeStack = createStackNavigator();

const PantryStackNavigator: React.FC = () => {
  return (
    <PantryStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: Colors.textPrimary,
        },
        headerTintColor: Colors.primary,
      }}
    >
      <PantryStack.Screen
        name="PantryList"
        component={PantryScreen}
        options={{
          title: 'My Pantry',
        }}
      />
      <PantryStack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{
          title: 'Add Item',
        }}
      />
      <PantryStack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{
          title: 'Item Details',
        }}
      />
      <PantryStack.Screen
        name="EditItem"
        component={EditItemScreen}
        options={{
          title: 'Edit Item',
        }}
      />
    </PantryStack.Navigator>
  );
};

const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: Colors.textPrimary,
        },
        headerTintColor: Colors.primary,
      }}
    >
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <HomeStack.Screen
        name="GenerateRecipe"
        component={GenerateRecipeScreen}
        options={{ title: 'Generate Recipe' }}
      />
      <HomeStack.Screen
        name="Cookbook"
        component={CookbookScreen}
        options={{ title: 'My Cookbook' }}
      />
    </HomeStack.Navigator>
  );
};

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 14,
        },
        tabBarStyle: {
          backgroundColor: Colors.surface,
          height: 60,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: Colors.textPrimary,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Pantry"
        component={PantryStackNavigator}
        options={{
          title: 'My Pantry',
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Get the nested navigator state
            const state = navigation.getState();
            const pantryTabState = state.routes.find(r => r.name === 'Pantry')?.state;
            
            // If we're not already on PantryList, navigate to it
            // This will pop all screens above PantryList in the stack
            if (pantryTabState && pantryTabState.routes && pantryTabState.index !== undefined) {
              const currentRoute = pantryTabState.routes[pantryTabState.index];
              if (currentRoute && currentRoute.name !== 'PantryList') {
                // Navigate to PantryList, which will pop to it if it exists in the stack
                (navigation as any).navigate('Pantry', { screen: 'PantryList' });
              }
            }
          },
        })}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Create a key that changes when auth state changes
  // This forces NavigationContainer to reset
  const navigationKey = user
    ? user.profile_completed
      ? `auth-complete-${user.id}`
      : `auth-incomplete-${user.id}`
    : 'no-auth';

  return (
    <NavigationContainer key={navigationKey}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          // User not logged in
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !user.profile_completed ? (
          // User logged in but profile not complete
          <>
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
          </>
        ) : (
          // User logged in and profile complete
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default AppNavigator;
