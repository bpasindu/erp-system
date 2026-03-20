import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import SalesScreen from '../screens/SalesScreen';
import InvoicesScreen from '../screens/InvoicesScreen';

const Tab = createBottomTabNavigator();

// Hardcoded theme constants to isolate import issues
const THEME = {
  primary: '#2563eb',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
};

// Placeholder screens for other tabs
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{name} Screen</Text>
    <Text style={styles.placeholderSub}>Coming Soon</Text>
  </View>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.textLight,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📊</Text>,
        }}
      />
      <Tab.Screen 
        name="Inventory" 
        component={InventoryScreen} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📦</Text>,
        }}
      />
      <Tab.Screen 
        name="Sales" 
        component={SalesScreen} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🛒</Text>,
        }}
      />
      <Tab.Screen 
        name="Invoices" 
        component={InvoicesScreen} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📄</Text>,
        }}
      />
      <Tab.Screen 
        name="AI" 
        children={() => <PlaceholderScreen name="AI" />} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🤖</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
  },
  placeholderSub: {
    fontSize: 16,
    color: THEME.textLight,
    marginTop: 8,
  },
});

export default MainTabNavigator;
