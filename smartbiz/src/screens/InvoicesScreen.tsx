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
  Alert,
  Modal,
  ScrollView,
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
  onPress: () => void;
}

const InvoiceCard = ({ invoice, customerName, onPress }: InvoiceCardProps) => {
  const isPaid = invoice.status?.toLowerCase() === 'paid';
  const formattedDate = invoice.createdAt ? String(invoice.createdAt).slice(0, 10) : '';
  const invoiceLabel = invoice.invoiceNumber || `INV-${invoice.id}`;

  return (
    <TouchableOpacity style={styles.invoiceCard} onPress={onPress}>
      <View style={[styles.invoiceIcon, { backgroundColor: isPaid ? COLORS.success + '18' : COLORS.warning + '18' }]}>
        <Text style={{ fontSize: 18 }}>🧾</Text>
      </View>

      <View style={styles.invoiceInfo}>
        <Text style={styles.invoiceNumber}>{invoiceLabel}</Text>
        <Text style={styles.invoiceMeta}>{customerName} · {formattedDate}</Text>
      </View>

      <View style={styles.invoiceSide}>
        <Text style={styles.invoiceAmount}>Rs. {(invoice.totalAmount || 0).toLocaleString()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isPaid ? COLORS.success : COLORS.error }]}>
          <Text style={styles.statusText}>{isPaid ? 'paid' : 'unpaid'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const InvoicesScreen = () => {
  const insets = useSafeAreaInsets();

  // 1. All hooks at the top
  const [invoices, setInvoices] = useState<SalesService.Invoice[]>([]);
  const [customerMap, setCustomerMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<SalesService.Invoice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await AuthService.getUser();
        if (user && user.businessId) {
          const [invoiceData, customerData] = await Promise.all([
            SalesService.getInvoicesByBusiness(user.businessId),
            ProductService.getCustomersByBusiness(user.businessId),
          ]);

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
    fetchData();
  }, []);

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

  // 2. Event handlers
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const user = await AuthService.getUser();
      if (user && user.businessId) {
        const [invoiceData, customerData] = await Promise.all([
          SalesService.getInvoicesByBusiness(user.businessId),
          ProductService.getCustomersByBusiness(user.businessId),
        ]);
        const map: Record<number, string> = {};
        customerData.forEach((c) => { map[c.id] = c.name; });
        setCustomerMap(map);
        const sorted = [...invoiceData].sort((a, b) =>
          String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
        );
        setInvoices(sorted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedInvoice) return;
    const newStatus = selectedInvoice.status?.toLowerCase() === 'paid' ? 'unpaid' : 'paid';
    
    setStatusUpdating(true);
    try {
      const updated = await SalesService.updateInvoiceStatus(selectedInvoice.id, newStatus);
      setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
      setSelectedInvoice(updated);
      Alert.alert('Success', `Invoice marked as ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // 3. Early return for loading state (after all hooks)
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // 4. Main render
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.logoText}>SmartBiz</Text>
        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>SB</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Invoices</Text>
        <Text style={styles.subtitle}>{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</Text>
      </View>

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
            onPress={() => {
              setSelectedInvoice(item);
              setModalVisible(true);
            }}
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

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedInvoice?.invoiceNumber || `INV-${selectedInvoice?.id}`}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailValue}>
                  {customerMap[(selectedInvoice as any)?.customerId || 0] || selectedInvoice?.customerName || 'Walk-in customer'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{selectedInvoice?.createdAt ? String(selectedInvoice.createdAt).slice(0, 10) : ''}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <TouchableOpacity 
                  onPress={handleToggleStatus} 
                  disabled={statusUpdating}
                  style={[styles.modalStatusBadge, { backgroundColor: selectedInvoice?.status?.toLowerCase() === 'paid' ? COLORS.success + '30' : COLORS.error + '30' }]}
                >
                  {statusUpdating ? (
                    <ActivityIndicator size="small" color={selectedInvoice?.status?.toLowerCase() === 'paid' ? COLORS.success : COLORS.error} />
                  ) : (
                    <Text style={[styles.modalStatusText, { color: selectedInvoice?.status?.toLowerCase() === 'paid' ? COLORS.success : COLORS.error }]}>
                      {selectedInvoice?.status?.toLowerCase() || 'unpaid'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                {(selectedInvoice?.items || []).map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.description} ×{item.quantity}</Text>
                    <Text style={styles.itemPrice}>Rs. {item.totalPrice.toLocaleString()}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (10%)</Text>
                <Text style={styles.summaryValue}>Rs. {((selectedInvoice?.totalAmount || 0) * 0.1).toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>Rs. {(selectedInvoice?.totalAmount || 0).toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.viewPdfButton} 
                onPress={() => Alert.alert('Action', 'Opening PDF viewer...')}
              >
                <Text style={[styles.actionIcon, { color: '#fff' }]}>👁️</Text>
                <Text style={styles.actionButtonText}>View PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.downloadButton} 
                onPress={() => Alert.alert('Action', 'Downloading invoice...')}
              >
                <Text style={[styles.actionIcon, { color: '#fff' }]}>⬇️</Text>
                <Text style={styles.actionButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: '#0f172a', width: '100%', borderRadius: 24, padding: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { color: '#f8fafc', fontSize: 20, fontWeight: '800' },
  modalCloseIcon: { color: '#94a3b8', fontSize: 18, fontWeight: '600' },
  detailContainer: { backgroundColor: '#1e293b', borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
  detailLabel: { color: '#94a3b8', fontSize: 14 },
  detailValue: { color: '#f8fafc', fontSize: 14, fontWeight: '600' },
  modalStatusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  modalStatusText: { fontSize: 12, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: SPACING.md },
  itemsList: { maxHeight: 150 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  itemName: { color: '#f8fafc', fontSize: 14 },
  itemPrice: { color: '#f8fafc', fontSize: 14, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs },
  summaryLabel: { color: '#94a3b8', fontSize: 14 },
  summaryValue: { color: '#f8fafc', fontSize: 14, fontWeight: '600' },
  totalLabel: { color: '#f8fafc', fontSize: 18, fontWeight: '800' },
  totalValue: { color: COLORS.primary, fontSize: 18, fontWeight: '800' },
  modalActions: { flexDirection: 'row', gap: SPACING.md },
  viewPdfButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingVertical: 12 },
  downloadButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12 },
  actionIcon: { marginRight: 8, fontSize: 16 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default InvoicesScreen;
