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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ProductService from '../services/product.service';
import * as AuthService from '../services/auth.service';

// Hardcoded theme constants
const COLORS = {
  primary: '#2563eb',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  error: '#ef4444',
  border: '#e2e8f0',
  shadow: 'rgba(0, 0, 0, 0.05)',
};
const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductItem = ({ product }: { product: ProductService.Product }) => {
  const isLowStock = product.stockQuantity <= (product.minStockThreshold || 0);
  return (
    <View style={styles.productCard}>
      <View style={styles.productIconContainer}>
        <Text style={styles.productEmoji}>📦</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>
          {product.category || product.sku || '—'}
        </Text>
        <Text style={styles.productPrice}>
          Rs. {(product.price || 0).toLocaleString()}
        </Text>
      </View>
      <View style={styles.productQuantityContainer}>
        <Text style={styles.productQuantity}>{product.stockQuantity ?? '—'}</Text>
        {isLowStock && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Low</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Add Stock Modal ──────────────────────────────────────────────────────────
interface AddStockModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

const EMPTY_FORM = {
  name: '',
  sku: '',
  description: '',
  price: '',
  cost: '',
  stockQuantity: '',
};

const AddStockModal = ({ visible, onClose, onSuccess, businessId }: AddStockModalProps) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof EMPTY_FORM) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Product name is required.');
      return;
    }
    const price = parseFloat(form.price);
    const cost = parseFloat(form.cost);
    const qty = parseInt(form.stockQuantity, 10);
    if (isNaN(price) || price < 0) {
      Alert.alert('Validation', 'Please enter a valid price.');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      Alert.alert('Validation', 'Please enter a valid cost.');
      return;
    }

    setSubmitting(true);
    try {
      await ProductService.createProduct({
        businessId,
        name: form.name.trim(),
        sku: form.sku.trim(),
        description: form.description.trim(),
        price,
        cost,
        stockQuantity: isNaN(qty) ? 0 : qty,
      });
      Alert.alert('Success', 'Product added successfully!');
      setForm(EMPTY_FORM);
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to add product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Inventory</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <Text style={styles.fieldLabel}>Product Name *</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.name}
              onChangeText={set('name')}
              placeholder="e.g. Wireless Mouse"
              placeholderTextColor={COLORS.textLight}
            />

            {/* SKU */}
            <Text style={styles.fieldLabel}>SKU</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.sku}
              onChangeText={set('sku')}
              placeholder="e.g. WM-2024"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="characters"
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.fieldInput, styles.textArea]}
              value={form.description}
              onChangeText={set('description')}
              placeholder="Optional product description"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
            />

            {/* Price & Cost row */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Price (Rs.) *</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form.price}
                  onChangeText={set('price')}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Cost (Rs.) *</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form.cost}
                  onChangeText={set('cost')}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Stock Quantity */}
            <Text style={styles.fieldLabel}>Initial Stock Quantity</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.stockQuantity}
              onChangeText={set('stockQuantity')}
              placeholder="Enter quantity"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Add Product</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const InventoryScreen = () => {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<ProductService.Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [businessId, setBusinessId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      const user = await AuthService.getUser();
      if (user && user.businessId) {
        setBusinessId(user.businessId);
        const data = await ProductService.getProductsByBusiness(user.businessId);
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchProducts(); };

  const filteredProducts = useMemo(() =>
    products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    ), [products, searchQuery]);

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
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>{products.length} products</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Stock</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductItem product={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      {businessId && (
        <AddStockModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={fetchProducts}
          businessId={businessId}
        />
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textLight, marginTop: 2 },
  addButton: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  searchContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, height: 48 },
  searchIcon: { marginRight: 8, fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2 },
  productIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  productEmoji: { fontSize: 20 },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  productCategory: { fontSize: 12, color: COLORS.textLight, marginTop: 1 },
  productPrice: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  productQuantityContainer: { alignItems: 'flex-end' },
  productQuantity: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  lowStockBadge: { backgroundColor: COLORS.error + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  lowStockText: { color: COLORS.error, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textLight, fontSize: 16, fontStyle: 'italic' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  modalClose: { fontSize: 18, color: COLORS.textLight, padding: SPACING.xs },
  modalBody: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.md },
  fieldInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: SPACING.md, height: 48, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.background },
  textArea: { height: 90, paddingTop: 12, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: SPACING.md },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.xl, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default InventoryScreen;
