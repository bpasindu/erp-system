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
  border: '#e2e8f0',
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

interface SaleCardProps {
  invoice: SalesService.Invoice;
}

const SaleCard = ({ invoice }: SaleCardProps) => {
  const isPaid = invoice.status?.toLowerCase() === 'paid';
  const formattedDate = invoice.createdAt
    ? String(invoice.createdAt).slice(0, 10)
    : '';

  return (
    <View style={styles.saleCard}>
      <View style={styles.saleInfo}>
        <Text style={styles.invoiceNumber}>
          Invoice {invoice.invoiceNumber || `INV-${invoice.id}`}
        </Text>
        <Text style={styles.saleDate}>{formattedDate}</Text>
      </View>
      <View style={styles.saleSide}>
        <Text style={[styles.saleAmount, { color: isPaid ? COLORS.success : COLORS.primary }]}>
          Rs. {(invoice.totalAmount || 0).toLocaleString()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: isPaid ? COLORS.success + '20' : COLORS.primary + '15' }]}>
          <Text style={[styles.statusText, { color: isPaid ? COLORS.success : COLORS.primary }]}>
            {(invoice.status || 'UNPAID').toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const SalesScreen = () => {
  const insets = useSafeAreaInsets();

  // Form state
  const [selectedProduct, setSelectedProduct] = useState<ProductService.Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Data state
  const [products, setProducts] = useState<ProductService.Product[]>([]);
  const [invoices, setInvoices] = useState<SalesService.Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Product picker modal
  const [pickerVisible, setPickerVisible] = useState(false);

  const fetchData = async () => {
    try {
      const user = await AuthService.getUser();
      if (user && user.businessId) {
        const [prods, invs] = await Promise.all([
          ProductService.getProductsByBusiness(user.businessId),
          SalesService.getInvoicesByBusiness(user.businessId),
        ]);
        setProducts(prods);
        // Sort newest first
        const sorted = [...invs].sort((a, b) =>
          String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
        );
        setInvoices(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  const unitPrice = selectedProduct ? selectedProduct.price : 0;
  const qty = parseInt(quantity, 10) || 0;
  const totalPrice = unitPrice * qty;

  const handleAddSale = async () => {
    if (!selectedProduct) {
      Alert.alert('Missing Info', 'Please select a product.');
      return;
    }
    if (qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await AuthService.getUser();
      if (!user || !user.businessId) {
        throw new Error('User not authenticated');
      }
      await SalesService.createSale(
        user.businessId,
        customerName.trim() || 'Walk-in customer',
        selectedProduct.id,
        qty,
        unitPrice,
      );
      Alert.alert('Success', 'Sale recorded successfully!');
      // Reset form
      setSelectedProduct(null);
      setQuantity('1');
      setCustomerName('');
      // Refresh list
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to record sale. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>SmartBiz</Text>
        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>SB</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* New Sale Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Sale</Text>
          <Text style={styles.cardSubtitle}>Record a sale entry</Text>

          {/* Product Picker */}
          <Text style={styles.label}>Product</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={selectedProduct ? styles.pickerValue : styles.pickerPlaceholder}>
              {selectedProduct ? selectedProduct.name : 'Select product'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>

          {/* Quantity & Price Row */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Price (Rs.)</Text>
              <TextInput
                style={[styles.input, styles.inputReadOnly]}
                value={unitPrice > 0 ? String(unitPrice) : ''}
                placeholder="—"
                placeholderTextColor={COLORS.textLight}
                editable={false}
              />
            </View>
          </View>

          {/* Customer Name */}
          <Text style={styles.label}>Customer Name</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Walk-in customer"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {/* Total Preview */}
          {totalPrice > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Rs. {totalPrice.toLocaleString()}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.addButton, submitting && { opacity: 0.7 }]}
            onPress={handleAddSale}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>🛒  Add Sale</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Sales */}
        <Text style={styles.sectionTitle}>Recent Sales</Text>
        {invoices.length === 0 ? (
          <Text style={styles.emptyText}>No sales yet</Text>
        ) : (
          invoices.slice(0, 20).map((inv) => (
            <SaleCard key={inv.id} invoice={inv} />
          ))
        )}
      </ScrollView>

      {/* Product Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.productOption,
                    selectedProduct?.id === item.id && styles.productOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedProduct(item);
                    setPickerVisible(false);
                  }}
                >
                  <View>
                    <Text style={styles.productOptionName}>{item.name}</Text>
                    <Text style={styles.productOptionSku}>{item.category}</Text>
                  </View>
                  <Text style={styles.productOptionPrice}>Rs. {(item.price || 0).toLocaleString()}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No products available</Text>
              }
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoText: {
    fontSize: 20,
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
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    height: 48,
    backgroundColor: COLORS.background,
  },
  pickerPlaceholder: {
    color: COLORS.textLight,
    fontSize: 15,
  },
  pickerValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  chevron: {
    color: COLORS.textLight,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfField: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    height: 48,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  inputReadOnly: {
    color: COLORS.textLight,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  saleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  saleInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  saleDate: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  saleSide: {
    alignItems: 'flex-end',
    gap: 4,
  },
  saleAmount: {
    fontSize: 16,
    fontWeight: '800',
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 18,
    color: COLORS.textLight,
    padding: SPACING.xs,
  },
  productOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productOptionSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  productOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  productOptionSku: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  productOptionPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default SalesScreen;
