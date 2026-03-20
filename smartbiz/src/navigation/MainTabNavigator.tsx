import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();

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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
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
        children={() => <PlaceholderScreen name="Inventory" />} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📦</Text>,
        }}
      />
      <Tab.Screen 
        name="Sales" 
        children={() => <PlaceholderScreen name="Sales" />} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🛒</Text>,
        }}
      />
      <Tab.Screen 
        name="Invoices" 
        children={() => <PlaceholderScreen name="Invoices" />} 
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
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    backgroundColor: COLORS.background,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  placeholderSub: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 8,
  },
});

export default MainTabNavigator;
