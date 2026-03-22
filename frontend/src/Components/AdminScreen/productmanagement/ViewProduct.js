// C&V PetShop/frontend/src/Components/AdminScreen/productmanagement/ViewProduct.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { getToken } from '../../../utils/helper';
import { getOrderedProductImages } from '../../../utils/productImages';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AdminDrawer from '../AdminDrawer';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ViewProductScreen({ navigation, route }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${BACKEND_URL}/api/v1/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduct(res.data.product);
      setReviews(res.data.product.reviews || []);
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            const { logout } = await import('../../../utils/helper');
            await logout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const ViewProductContent = () => {
    const displayImages = getOrderedProductImages(product.images);

    // Determine which price to display
    const displayPrice = product.isOnSale && product.discountedPrice 
      ? parseFloat(product.discountedPrice).toFixed(2) 
      : parseFloat(product.price || 0).toFixed(2);
    
    const originalPrice = product.isOnSale && product.discountedPrice 
      ? parseFloat(product.price).toFixed(2) 
      : null;

    return (
      <ScrollView style={styles.container}>
        {displayImages.length > 0 && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: displayImages[imageIndex]?.url || displayImages[imageIndex] }}
              style={styles.mainImage}
            />
            {displayImages.length > 1 && (
              <FlatList
                horizontal
                data={displayImages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => setImageIndex(index)}>
                    <Image
                      source={{ uri: item.url }}
                      style={[
                        styles.thumbnail,
                        index === imageIndex && styles.selectedThumbnail,
                      ]}
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.thumbnailContainer}
              />
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.title}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
            <View>
              {product.isOnSale && product.discountedPrice ? (
                <>
                  <View style={styles.discountRow}>
                    <Text style={styles.originalPrice}>₱{originalPrice}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>
                        {product.discountPercentage ? `${product.discountPercentage}% OFF` : 'SALE'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.discountedPrice}>₱{displayPrice}</Text>
                </>
              ) : (
                <Text style={styles.price}>₱{displayPrice}</Text>
              )}
            </View>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={18} color="#f39c12" />
              <Text style={styles.rating}>{product.ratings?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.reviewCount}>({product.numOfReviews || 0} reviews)</Text>
            </View>
          </View>

          {/* Show discount period if on sale */}
          {product.isOnSale && product.discountStartDate && product.discountEndDate && (
            <View style={styles.discountPeriodContainer}>
              <Icon name="event" size={16} color="#e74c3c" />
              <Text style={styles.discountPeriodText}>
                Sale ends: {new Date(product.discountEndDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>{product.category}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Stock:</Text>
            <Text style={[
              styles.value,
              product.stock > 0 ? styles.inStock : styles.outOfStock
            ]}>
              {product.stock} {product.stock > 0 ? 'available' : 'out of stock'}
            </Text>
          </View>

          {product.supplier && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Supplier:</Text>
              <Text style={styles.value}>{product.supplier?.name || 'N/A'}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {product.supplier && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supplier Information</Text>
              <Text style={styles.text}>{product.supplier.name}</Text>
              <Text style={styles.text}>{product.supplier.email}</Text>
              <Text style={styles.text}>{product.supplier.phone}</Text>
              <Text style={styles.text}>{product.supplier.address?.city}, {product.supplier.address?.state}</Text>
            </View>
          )}
        </View>

        {reviews.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Customer Reviews ({reviews.length})</Text>
            {reviews.map((review) => (
              <View key={review._id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.user?.name || 'Anonymous'}</Text>
                  <View style={styles.reviewRating}>
                    <Icon name="star" size={16} color="#f39c12" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('UpdateProduct', { product })}
          >
            <Icon name="edit" size={20} color="white" />
            <Text style={styles.buttonText}>Edit Product</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={20} color="white" />
            <Text style={styles.buttonText}>Back to List</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <AdminDrawer onLogout={handleLogout}>
      <ViewProductContent />
    </AdminDrawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  thumbnailContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#3498db',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  discountBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  discountPeriodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  discountPeriodText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 18,
    color: '#f39c12',
    fontWeight: 'bold',
    marginLeft: 5,
    marginRight: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
  },
  inStock: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  outOfStock: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  description: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
  },
  text: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  reviewItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#f39c12',
    fontWeight: 'bold',
  },
  reviewComment: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  editButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  backButton: {
    backgroundColor: '#95a5a6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});
