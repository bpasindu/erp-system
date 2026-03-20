import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
// Hardcoded theme constants to isolate import issues
const COLORS = {
  primary: '#2563eb',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  success: '#22c55e',
  error: '#ef4444',
  shadow: 'rgba(0, 0, 0, 0.05)',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
import * as DashboardService from '../services/dashboard.service';
import * as AuthService from '../services/auth.service';

const { width } = Dimensions.get('window');

const KPICard = ({ title, value, color, icon }: any) => (
  <View style={styles.kpiCard}>
    <View style={[styles.kpiIcon, { backgroundColor: color + '20' }]}>
       {/* Icon placeholder - would use vector icons here */}
       <Text style={{ color: color, fontSize: 12 }}>{icon}</Text>
    </View>
    <Text style={styles.kpiTitle}>{title}</Text>
    <Text style={styles.kpiValue}>{value}</Text>
  </View>
);

const ActionButton = ({ title, icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
       <Text style={{ color: color, fontSize: 18 }}>{icon}</Text>
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

const DashboardScreen = ({ navigation }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchData = async () => {
    try {
      const user = await AuthService.getUser();
      if (user && user.businessId) {
        const result = await DashboardService.getDashboardData(user.businessId);
        setData(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>SmartBiz</Text>
        </View>
        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>SB</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>Welcome back, Business Owner</Text>
        </View>

        <View style={styles.kpiGrid}>
          <KPICard 
            title="Total Products" 
            value={data?.totalProducts || 0} 
            color="#3b82f6" 
            icon="📦"
          />
          <KPICard 
            title="Today's Sales" 
            value={`Rs.${(data?.todaySales || 0).toLocaleString()}`} 
            color="#10b981" 
            icon="🛒"
          />
          <KPICard 
            title="Total Revenue" 
            value={`Rs.${(data?.monthSales || 0).toLocaleString()}`} 
            color="#f59e0b" 
            icon="💰"
          />
          <KPICard 
            title="Low Stock" 
            value={data?.lowStockItems || 0} 
            color="#ef4444" 
            icon="⚠️"
          />
        </View>

        <View style={styles.actionsGrid}>
          <ActionButton title="Add Sale" icon="🛒" color="#3b82f6" onPress={() => navigation.navigate('Sales')} />
          <ActionButton title="Add Stock" icon="+" color="#10b981" onPress={() => navigation.navigate('Inventory')} />
          <ActionButton title="Invoices" icon="📄" color="#f59e0b" onPress={() => navigation.navigate('Invoices')} />
          <ActionButton title="Ask AI" icon="🤖" color="#8b5cf6" onPress={() => navigation.navigate('AI')} />
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Sales Last 7 Days</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={data?.salesChartData || { labels: [], datasets: [{ data: [] }] }}
              width={width - SPACING.lg * 2}
              height={220}
              yAxisLabel="Rs."
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                labelColor: (opacity = 1) => COLORS.textLight,
                style: { borderRadius: 16 },
                propsForDots: { r: '6', strokeWidth: '2', stroke: COLORS.primary },
              }}
              style={{ marginVertical: 8, borderRadius: 16 }}
              fromZero
              showValuesOnTopOfBars
            />
          </View>
        </View>

        <View style={styles.recentInvoicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Invoices</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {(data?.recentInvoices || []).map((inv: any, index: number) => (
            <View key={index} style={styles.invoiceItem}>
               <View style={styles.invoiceMain}>
                  <Text style={styles.invoiceId}>{inv.id}</Text>
                  <Text style={styles.invoiceDate}>Kamal Perera</Text>
               </View>
               <View style={styles.invoiceSide}>
                  <Text style={styles.invoiceAmount}>Rs. {inv.amount.toLocaleString()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: inv.status === 'paid' ? COLORS.success + '20' : COLORS.error + '20' }]}>
                    <Text style={[styles.statusText, { color: inv.status === 'paid' ? COLORS.success : COLORS.error }]}>{inv.status.toUpperCase()}</Text>
                  </View>
               </View>
            </View>
          ))}
          {(data?.recentInvoices || []).length === 0 && (
             <Text style={styles.emptyText}>No recent invoices found.</Text>
          )}
        </View>
      </ScrollView>

      {/* Placeholder for Bottom Navigation would be here if not using @react-navigation/bottom-tabs */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  welcomeSection: {
    marginVertical: SPACING.lg,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 20,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  kpiTitle: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.lg,
  },
  actionButton: {
    alignItems: 'center',
    width: (width - SPACING.lg * 2) / 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  chartSection: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  recentInvoicesSection: {
    marginVertical: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 2,
  },
  invoiceMain: {
    justifyContent: 'center',
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  invoiceDate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  invoiceSide: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: SPACING.md,
  },
});

export default DashboardScreen;
