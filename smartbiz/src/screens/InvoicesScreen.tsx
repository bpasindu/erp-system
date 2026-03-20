import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SalesService from '../services/sales.service';
import * as ProductService from '../services/product.service';
import * as AuthService from '../services/auth.service';

// Hardcoded theme constants
const COLORS = {
  primary: '#2563eb',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  border: '#e2e8f0',
};

const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

interface InvoiceCardProps {
  invoice: SalesService.Invoice;
  customerName: string;
}

const InvoiceCard = ({ invoice, customerName }: InvoiceCardProps) => {
  const isPaid = invoice.status?.toLowerCase() === 'paid';
  const formattedDate = invoice.createdAt ? String(invoice.createdAt).slice(0, 10) : '';
  const invoiceLabel = invoice.invoiceNumber || `INV-${invoice.id}`;

  return (
    <View style={styles.invoiceCard}>
      {/* Icon */}
      <View style={[styles.invoiceIcon, { backgroundColor: isPaid ? COLORS.success + '18' : COLORS.warning + '18' }]}>
        <Text style={{ fontSize: 18 }}>🧾</Text>
      </View>

      {/* Info */}
      <View style={styles.invoiceInfo}>
        <Text style={styles.invoiceNumber}>{invoiceLabel}</Text>
        <Text style={styles.invoiceMeta}>{customerName} · {formattedDate}</Text>
      </View>

      {/* Amount + Badge */}
      <View style={styles.invoiceSide}>
        <Text style={styles.invoiceAmount}>Rs. {(invoice.totalAmount || 0).toLocaleString()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isPaid ? COLORS.success : COLORS.error }]}>
          <Text style={styles.statusText}>{isPaid ? 'paid' : 'unpaid'}</Text>
        </View>
      </View>
    </View>
  );
};

const InvoicesScreen = () => {
  const insets = useSafeAreaInsets();

  const [invoices, setInvoices] = useState<SalesService.Invoice[]>([]);
  const [customerMap, setCustomerMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const user = await AuthService.getUser();
      if (user && user.businessId) {
        const [invoiceData, customerData] = await Promise.all([
          SalesService.getInvoicesByBusiness(user.businessId),
          ProductService.getCustomersByBusiness(user.businessId),
        ]);

        // Build customerId → name map
        const map: Record<number, string> = {};
        customerData.forEach((c) => { map[c.id] = c.name; });
        setCustomerMap(map);

        const sorted = [...invoiceData].sort((a, b) =>
          String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
        );
        setInvoices(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const cName = customerMap[(inv as any).customerId] || '';
      return (
        (inv.invoiceNumber || '').toLowerCase().includes(q) ||
        cName.toLowerCase().includes(q) ||
        (inv.status || '').toLowerCase().includes(q)
      );
    });
  }, [invoices, searchQuery, customerMap]);

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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>SmartBiz</Text>
        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>SB</Text>
        </View>
      </View>

      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Invoices</Text>
        <Text style={styles.subtitle}>{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoices..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <InvoiceCard
            invoice={item}
            customerName={
              customerMap[(item as any).customerId] ||
              item.customerName ||
              'Walk-in customer'
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🧾</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No invoices match your search' : 'No invoices yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logoText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  profileCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
  profileText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  titleRow: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textLight, marginTop: 2 },
  searchContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, height: 48 },
  searchIcon: { marginRight: SPACING.sm, fontSize: 15 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  clearIcon: { fontSize: 14, color: COLORS.textLight, paddingLeft: SPACING.sm },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  invoiceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  invoiceIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  invoiceInfo: { flex: 1 },
  invoiceNumber: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  invoiceMeta: { fontSize: 12, color: COLORS.textLight, marginTop: 3 },
  invoiceSide: { alignItems: 'flex-end', gap: 4 },
  invoiceAmount: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: SPACING.md },
  emptyText: { color: COLORS.textLight, fontSize: 16, fontStyle: 'italic' },
});

export default InvoicesScreen;
