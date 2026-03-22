// CVPetShop/frontend/src/Components/UserScreen/Orders/OrderDetails.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Alert,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { getToken, logout } from '../../../utils/helper';
import UserDrawer from '../UserDrawer';
import Header from '../../layouts/Header';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const THEME = {
  colors: {
    background: '#F5F3EE',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F6F0',
    text: '#1F2A1F',
    muted: '#6B7C6A',
    accent: '#2E7D32',
    accentDark: '#1B5E20',
    accentSoft: '#E6F2E6',
    border: '#E6E0D9',
    success: '#2F855A',
    warning: '#A16207',
    warningSoft: '#FEF3C7',
    danger: '#C65D3B',
    dangerSoft: '#FDECE8',
    star: '#D4A017',
    overlay: 'rgba(15, 23, 15, 0.55)',
  },
};

// Status color mapping - Updated to match your model's enum values
const STATUS_COLORS = {
  'Processing': THEME.colors.warning,
  'Accepted': '#3D6C78',
  'Out for Delivery': '#9A6A1B',
  'Delivered': THEME.colors.success,
  'Cancelled': THEME.colors.danger,
};

// Status step mapping for timeline - Updated to match your workflow
const STATUS_STEPS = ['Processing', 'Accepted', 'Out for Delivery', 'Delivered'];

export default function OrderDetails({ navigation, route }) {
  const { orderId, order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Review states
  const [reviews, setReviews] = useState({});
  const [userReviews, setUserReviews] = useState({});
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState({});

  // Function to dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (initialOrder?.orderStatus === 'Delivered') {
      fetchAllProductReviews();
    }

    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrderDetails();
    });

    return unsubscribe;
  }, [navigation, orderId]);

  useEffect(() => {
    // When order is updated and delivered, fetch reviews
    if (order && order.orderStatus === 'Delivered' && order.orderItems) {
      fetchAllProductReviews();
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/v1/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrder(response.data.order);
        // If order is delivered, fetch reviews
        if (response.data.order.orderStatus === 'Delivered') {
          fetchAllProductReviews();
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);

      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          error.response?.data?.message || 'Please sign in again to view this order.',
          [{ text: 'OK', onPress: () => logout(navigation) }]
        );
        setError('Your session has expired. Please sign in again.');
        return;
      }

      setError(error.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProductReviews = async () => {
    if (!order || !order.orderItems) return;
    
    const token = await getToken();
    if (!token) return;

    // Fetch reviews for each product in the order
    for (const item of order.orderItems) {
      const productId = item.product?._id || item.product;
      if (productId) {
        fetchProductReviews(productId);
        fetchUserProductReview(productId);
      }
    }
  };

  const fetchProductReviews = async (productId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/reviews?productId=${productId}`);
      if (response.data.success) {
        setReviews(prev => ({ ...prev, [productId]: response.data.reviews }));
      }
    } catch (error) {
      console.error('Error fetching product reviews:', error);
    }
  };

  const fetchUserProductReview = async (productId) => {
    try {
      setLoadingReviews(prev => ({ ...prev, [productId]: true }));
      const token = await getToken();
      if (!token) return;

      const response = await axios.get(`${BACKEND_URL}/api/v1/review/user/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.review) {
        setUserReviews(prev => ({ ...prev, [productId]: response.data.review }));
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    } finally {
      setLoadingReviews(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleTrackOrder = () => {
    Alert.alert('Not Available', 'Tracking information is not available yet.');
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return STATUS_STEPS.indexOf(order.orderStatus);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openImageModal = (imageUri) => {
    dismissKeyboard(); // Dismiss keyboard when opening image modal
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const getProductImage = (item) => {
    // First check if the item has a direct image field (from order)
    if (item.image) {
      return item.image;
    }
    // Then check if the product is populated and has images
    if (item.product && item.product.images && item.product.images.length > 0) {
      return item.product.images[0].url || item.product.images[0];
    }
    return null;
  };

  const getAllProductImages = (item) => {
    const images = [];
    
    // Add the order item image if available
    if (item.image) {
      images.push(item.image);
    }
    
    // Add all product images if the product is populated
    if (item.product && item.product.images && item.product.images.length > 0) {
      item.product.images.forEach(img => {
        const imageUrl = img.url || img;
        if (!images.includes(imageUrl)) {
          images.push(imageUrl);
        }
      });
    }
    
    return images;
  };

  const openReviewModal = (product) => {
    dismissKeyboard(); // Dismiss keyboard when opening review modal
    const productId = product.product?._id || product.product;
    const existingReview = userReviews[productId];
    
    setSelectedProduct(product);
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(0);
      setComment('');
    }
    setReviewModalVisible(true);
  };

  const submitReview = async () => {
    if (!selectedProduct) return;
    
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      const token = await getToken();
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const productId = selectedProduct.product?._id || selectedProduct.product;
      const existingReview = userReviews[productId];
      
      const reviewData = {
        rating,
        comment,
        productId,
        orderId: order._id,
      };

      let response;
      if (existingReview) {
        // Update existing review
        response = await axios.put(`${BACKEND_URL}/api/v1/review/update`, reviewData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new review
        response = await axios.post(`${BACKEND_URL}/api/v1/review/create`, reviewData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        Alert.alert(
          'Success',
          existingReview ? 'Review updated successfully!' : 'Review submitted successfully!'
        );
        setReviewModalVisible(false);
        dismissKeyboard(); // Dismiss keyboard after submission
        // Refresh reviews
        fetchProductReviews(productId);
        fetchUserProductReview(productId);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (ratingValue, interactive = false, size = 20) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={interactive ? () => setRating(i) : null}
          disabled={!interactive}
        >
          <Icon
            name={i <= ratingValue ? 'star' : 'star-border'}
            size={size}
            color={i <= ratingValue ? THEME.colors.star : THEME.colors.border}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const renderReviewSection = (item) => {
    const productId = item.product?._id || item.product;
    if (!productId) return null;

    const productReviews = reviews[productId] || [];
    const userReview = userReviews[productId];
    const averageRating = productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : 0;

    return (
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>Product Reviews</Text>
          {userReview ? (
            <TouchableOpacity
              style={styles.editReviewButton}
              onPress={() => openReviewModal(item)}
            >
              <Icon name="edit" size={16} color={THEME.colors.accentDark} />
              <Text style={styles.editReviewText}>Edit Your Review</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.writeReviewButton}
              onPress={() => openReviewModal(item)}
            >
              <Icon name="rate-review" size={16} color="white" />
              <Text style={styles.writeReviewText}>Write a Review</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Average Rating */}
        {productReviews.length > 0 && (
          <View style={styles.averageRatingContainer}>
            <View style={styles.averageRatingRow}>
              <Text style={styles.averageRatingText}>{averageRating}</Text>
              <View style={styles.averageStars}>
                {renderStars(Math.round(averageRating), false, 16)}
              </View>
              <Text style={styles.totalReviews}>({productReviews.length} reviews)</Text>
            </View>
          </View>
        )}

        {/* User's Review (if exists) */}
        {userReview && (
          <View style={styles.userReviewContainer}>
            <Text style={styles.yourReviewLabel}>Your Review:</Text>
            <View style={styles.userReviewContent}>
              <View style={styles.userReviewStars}>
                {renderStars(userReview.rating, false, 16)}
              </View>
              <Text style={styles.userReviewComment}>{userReview.comment}</Text>
              <Text style={styles.userReviewDate}>
                {formatDate(userReview.createdAt)}
              </Text>
            </View>
          </View>
        )}

        {/* Other Reviews */}
        {productReviews.length > 0 && (
          <View style={styles.otherReviewsContainer}>
            <Text style={styles.otherReviewsTitle}>
              {userReview ? 'Other Customer Reviews' : 'Customer Reviews'}
            </Text>
            {productReviews
              .filter(r => !userReview || r._id !== userReview._id)
              .slice(0, 2)
              .map((review, index) => (
                <View key={index} style={styles.otherReviewItem}>
                  <View style={styles.otherReviewHeader}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    <View style={styles.reviewerStars}>
                      {renderStars(review.rating, false, 12)}
                    </View>
                  </View>
                  <Text style={styles.reviewerComment}>{review.comment}</Text>
                  <Text style={styles.reviewerDate}>
                    {formatDate(review.createdAt)}
                  </Text>
                </View>
              ))}
            {productReviews.length > 2 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View all {productReviews.length} reviews</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <UserDrawer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.accent} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </UserDrawer>
    );
  }

  if (error || !order) {
    return (
      <UserDrawer>
        <SafeAreaView style={styles.safeArea}>
          <Header />
          <View style={styles.errorContainer}>
            <Icon name="inventory-2" size={80} color={THEME.colors.border} />
            <Text style={styles.errorTitle}>Order Not Found</Text>
            <Text style={styles.errorText}>
              {error || "The order you're looking for doesn't exist or has been removed."}
            </Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </UserDrawer>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <UserDrawer>
      <SafeAreaView style={styles.safeArea}>
        <Header />
        
        {/* Image Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={30} color="white" />
            </TouchableOpacity>
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>

        {/* Review Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={reviewModalVisible}
          onRequestClose={() => {
            setReviewModalVisible(false);
            dismissKeyboard();
          }}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.reviewModalContainer}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.reviewModalContent}
              >
                <View style={styles.reviewModalHeader}>
                  <Text style={styles.reviewModalTitle}>
                    {userReviews[selectedProduct?.product?._id || selectedProduct?.product] 
                      ? 'Edit Your Review' 
                      : 'Write a Review'}
                  </Text>
                  <TouchableOpacity onPress={() => {
                    setReviewModalVisible(false);
                    dismissKeyboard();
                  }}>
                    <Icon name="close" size={24} color={THEME.colors.text} />
                  </TouchableOpacity>
                </View>

                {selectedProduct && (
                  <View style={styles.reviewProductInfo}>
                    <View style={styles.reviewProductImageContainer}>
                      {getProductImage(selectedProduct) ? (
                        <Image 
                          source={{ uri: getProductImage(selectedProduct) }} 
                          style={styles.reviewProductImage} 
                        />
                      ) : (
                        <View style={styles.reviewProductImagePlaceholder}>
                          <Icon name="local-florist" size={24} color={THEME.colors.muted} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.reviewProductName}>{selectedProduct.name}</Text>
                  </View>
                )}

                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingLabel}>Your Rating</Text>
                  <View style={styles.starsContainer}>
                    {renderStars(rating, true, 30)}
                  </View>
                </View>

                <View style={styles.commentContainer}>
                  <Text style={styles.commentLabel}>Your Review</Text>
                  <TextInput
                    style={styles.commentInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Share your experience with this product..."
                    value={comment}
                    onChangeText={setComment}
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitReviewButton, submittingReview && styles.submitButtonDisabled]}
                  onPress={submitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.submitReviewText}>
                      {userReviews[selectedProduct?.product?._id || selectedProduct?.product] 
                        ? 'Update Review' 
                        : 'Submit Review'}
                    </Text>
                  )}
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        
        {/* Main content with keyboard dismissal */}
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header with Back Button */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color={THEME.colors.text} />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Order Details</Text>
                <Text style={styles.orderId}>#{order._id?.slice(-8).toUpperCase()}</Text>
              </View>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[order.orderStatus] || '#999' }]} />
                <Text style={[styles.statusText, { color: STATUS_COLORS[order.orderStatus] || '#999' }]}>
                  {order.orderStatus}
                </Text>
              </View>
            </View>

            {/* Order Timeline - Only show for non-cancelled orders */}
            {order.orderStatus !== 'Cancelled' && (
              <View style={styles.timelineContainer}>
                <Text style={styles.sectionTitle}>Order Status</Text>
                <View style={styles.timeline}>
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <View key={step} style={styles.timelineStep}>
                        <View style={[
                          styles.timelineDot,
                          isCompleted && styles.timelineDotCompleted,
                          isCurrent && styles.timelineDotCurrent,
                        ]}>
                          {isCompleted && <Icon name="check" size={12} color="white" />}
                        </View>
                        <Text style={[
                          styles.timelineText,
                          isCompleted && styles.timelineTextCompleted,
                        ]}>
                          {step}
                        </Text>
                        {index < STATUS_STEPS.length - 1 && (
                          <View style={[
                            styles.timelineLine,
                            isCompleted && styles.timelineLineCompleted,
                          ]} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Cancelled Order Message */}
            {order.orderStatus === 'Cancelled' && (
              <View style={styles.cancelledContainer}>
                <Icon name="cancel" size={24} color={THEME.colors.danger} />
                <Text style={styles.cancelledText}>This order has been cancelled</Text>
              </View>
            )}

            {/* Order Items with Multiple Images and Reviews */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {order.orderItems?.map((item, index) => {
                const productImages = getAllProductImages(item);
                const mainImage = getProductImage(item);
                
                return (
                  <View key={index} style={styles.orderItemContainer}>
                    <View style={styles.orderItem}>
                      <TouchableOpacity 
                        style={styles.itemImageContainer}
                        onPress={() => mainImage && openImageModal(mainImage)}
                      >
                        {mainImage ? (
                          <Image source={{ uri: mainImage }} style={styles.itemImage} />
                        ) : (
                          <View style={styles.itemImagePlaceholder}>
                            <Icon name="local-florist" size={24} color={THEME.colors.muted} />
                          </View>
                        )}
                      </TouchableOpacity>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>₱{item.price?.toFixed(2)}</Text>
                        <View style={styles.itemQuantityRow}>
                          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                          <Text style={styles.itemSubtotal}>
                            Subtotal: ₱{(item.price * item.quantity).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    {/* All Product Images */}
                    {productImages.length > 1 && (
                      <View style={styles.allImagesContainer}>
                        <Text style={styles.allImagesTitle}>All Product Images:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {productImages.map((imageUri, imgIndex) => (
                            <TouchableOpacity
                              key={imgIndex}
                              style={styles.thumbnailContainer}
                              onPress={() => openImageModal(imageUri)}
                            >
                              <Image source={{ uri: imageUri }} style={styles.thumbnail} />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {/* Reviews Section - Only show if order is delivered */}
                    {order.orderStatus === 'Delivered' && renderReviewSection(item)}
                  </View>
                );
              })}
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items Price</Text>
                <Text style={styles.summaryValue}>₱{order.itemsPrice?.toFixed(2) || '0.00'}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping Price</Text>
                <Text style={styles.summaryValue}>₱{order.shippingPrice?.toFixed(2) || '0.00'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax Price</Text>
                <Text style={styles.summaryValue}>₱{order.taxPrice?.toFixed(2) || '0.00'}</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₱{order.totalPrice?.toFixed(2) || '0.00'}</Text>
              </View>
            </View>

            {/* Shipping Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shipping Information</Text>
              
              <View style={styles.infoRow}>
                <Icon name="location-on" size={18} color={THEME.colors.accent} />
                <Text style={styles.infoText}>
                  {order.shippingInfo?.address}, {order.shippingInfo?.city}, {' '}
                  {order.shippingInfo?.postalCode}, {order.shippingInfo?.country}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Icon name="phone" size={18} color={THEME.colors.accent} />
                <Text style={styles.infoText}>{order.shippingInfo?.phoneNo || 'N/A'}</Text>
              </View>
            </View>

            {/* Payment Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              
              <View style={styles.infoRow}>
                <Icon name="payment" size={18} color={THEME.colors.accent} />
                <Text style={styles.infoText}>
                  Payment ID: {order.paymentInfo?.id || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="receipt" size={18} color={THEME.colors.accent} />
                <Text style={styles.infoText}>
                  Payment Status: <Text style={[
                    styles.paymentStatus,
                    { color: order.paymentInfo?.status === 'paid' ? THEME.colors.success : THEME.colors.warning }
                  ]}>
                    {order.paymentInfo?.status || 'Pending'}
                  </Text>
                </Text>
              </View>

              {order.paidAt && (
                <View style={styles.infoRow}>
                  <Icon name="event" size={18} color={THEME.colors.accent} />
                  <Text style={styles.infoText}>
                    Paid At: {formatDate(order.paidAt)}
                  </Text>
                </View>
              )}
            </View>

            {/* Order Dates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Timeline</Text>
              
              <View style={styles.dateRow}>
                <Icon name="event" size={16} color={THEME.colors.muted} />
                <Text style={styles.dateLabel}>Order Placed:</Text>
                <Text style={styles.dateValue}>{formatDate(order.createdAt)}</Text>
              </View>
              
              {order.deliveredAt && (
                <View style={styles.dateRow}>
                  <Icon name="check-circle" size={16} color={THEME.colors.success} />
                  <Text style={styles.dateLabel}>Delivered:</Text>
                  <Text style={styles.dateValue}>{formatDate(order.deliveredAt)}</Text>
                </View>
              )}
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 30 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </UserDrawer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    fontSize: 15,
    color: THEME.colors.muted,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: THEME.colors.background,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.text,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: THEME.colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: THEME.colors.accentDark,
    fontSize: 15,
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  orderId: {
    fontSize: 12,
    color: THEME.colors.muted,
    marginTop: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  section: {
    backgroundColor: THEME.colors.surface,
    marginTop: 12,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.text,
    marginBottom: 12,
  },
  timelineContainer: {
    backgroundColor: THEME.colors.surface,
    marginTop: 12,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginTop: 10,
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  timelineDotCompleted: {
    backgroundColor: THEME.colors.success,
    borderColor: THEME.colors.success,
  },
  timelineDotCurrent: {
    borderColor: THEME.colors.accentDark,
    borderWidth: 3,
  },
  timelineText: {
    fontSize: 11,
    color: THEME.colors.muted,
    textAlign: 'center',
    lineHeight: 15,
  },
  timelineTextCompleted: {
    color: THEME.colors.text,
    fontWeight: '700',
  },
  timelineLine: {
    position: 'absolute',
    top: 13,
    right: -50,
    width: 80,
    height: 2,
    backgroundColor: THEME.colors.border,
  },
  timelineLineCompleted: {
    backgroundColor: THEME.colors.success,
  },
  cancelledContainer: {
    backgroundColor: THEME.colors.dangerSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3D0C7',
  },
  cancelledText: {
    color: THEME.colors.danger,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
  orderItemContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    paddingBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemImageContainer: {
    width: 76,
    height: 76,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceAlt,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.text,
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 13,
    color: THEME.colors.accentDark,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 12,
    color: THEME.colors.muted,
  },
  itemSubtotal: {
    fontSize: 12,
    color: THEME.colors.text,
    fontWeight: '700',
  },
  allImagesContainer: {
    marginTop: 10,
    marginLeft: 88,
  },
  allImagesTitle: {
    fontSize: 12,
    color: THEME.colors.muted,
    marginBottom: 8,
    fontWeight: '700',
  },
  thumbnailContainer: {
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  thumbnail: {
    width: 54,
    height: 54,
  },
  reviewSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  writeReviewText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
    fontWeight: '700',
  },
  editReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  editReviewText: {
    fontSize: 12,
    color: THEME.colors.accentDark,
    marginLeft: 4,
    fontWeight: '700',
  },
  averageRatingContainer: {
    marginBottom: 12,
  },
  averageRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRatingText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
    marginRight: 8,
  },
  averageStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  totalReviews: {
    fontSize: 12,
    color: THEME.colors.muted,
  },
  userReviewContainer: {
    backgroundColor: THEME.colors.surfaceAlt,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  yourReviewLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.accentDark,
    marginBottom: 4,
  },
  userReviewContent: {
    marginLeft: 4,
  },
  userReviewStars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  userReviewComment: {
    fontSize: 13,
    color: THEME.colors.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  userReviewDate: {
    fontSize: 10,
    color: THEME.colors.muted,
  },
  otherReviewsContainer: {
    marginTop: 8,
  },
  otherReviewsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.text,
    marginBottom: 8,
  },
  otherReviewItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  otherReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  reviewerStars: {
    flexDirection: 'row',
  },
  reviewerComment: {
    fontSize: 12,
    color: THEME.colors.muted,
    lineHeight: 18,
    marginBottom: 4,
  },
  reviewerDate: {
    fontSize: 10,
    color: THEME.colors.muted,
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: THEME.colors.accentDark,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: THEME.colors.muted,
  },
  summaryValue: {
    fontSize: 14,
    color: THEME.colors.text,
    fontWeight: '700',
  },
  discountValue: {
    color: THEME.colors.success,
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  totalValue: {
    fontSize: 19,
    fontWeight: '900',
    color: THEME.colors.accentDark,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.text,
    marginLeft: 10,
    lineHeight: 20,
  },
  paymentStatus: {
    fontWeight: '800',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 13,
    color: THEME.colors.muted,
    marginLeft: 8,
    marginRight: 4,
  },
  dateValue: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: THEME.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  reviewModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  reviewModalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '90%',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  reviewProductInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: THEME.colors.surfaceAlt,
    borderRadius: 16,
  },
  reviewProductImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
  },
  reviewProductImage: {
    width: '100%',
    height: '100%',
  },
  reviewProductImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.border,
  },
  reviewProductName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  commentContainer: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 16,
    padding: 12,
    fontSize: 14,
    color: THEME.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: THEME.colors.surfaceAlt,
  },
  submitReviewButton: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitReviewText: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
  },
});
