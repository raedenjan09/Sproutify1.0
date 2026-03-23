// Sproutify/frontend/src/Components/UserScreen/Home.js
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getUser, getToken } from '../../utils/helper';
import { getOrderedProductImageUrls } from '../../utils/productImages';
import UserDrawer from './UserDrawer';
import Header from '../layouts/Header';
import gardenTheme from '../../theme/gardenTheme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 260;

const CATEGORIES = ['All'];

const BANNERS = [
  {
    image: require('../sliding/1.jpg'),
    title: 'Turn any corner into a calmer garden retreat',
    subtitle: 'Browse plants, pots, and styling pieces made for greener homes.',
  },
  {
    image: require('../sliding/2.jpg'),
    title: 'Root your routine in better care essentials',
    subtitle: 'Tools, soil, and watering picks chosen for everyday growing.',
  },
  {
    image: require('../sliding/3.jpg'),
    title: 'Fresh foliage and seasonal garden finds',
    subtitle: 'Discover pieces that help your shelves, patios, and nooks feel alive.',
  },
  {
    image: require('../sliding/4.jpg'),
    title: 'Build a softer, healthier plant setup',
    subtitle: 'Shop practical garden goods without losing the warmth of home styling.',
  },
];

const THEME = {
  colors: {
    bg: gardenTheme.colors.canvas,
    surface: gardenTheme.colors.surface,
    surfaceAlt: gardenTheme.colors.surfaceMuted,
    surfaceGlow: gardenTheme.colors.accentGlow,
    text: gardenTheme.colors.textStrong,
    muted: gardenTheme.colors.muted,
    accent: gardenTheme.colors.accent,
    accentDark: gardenTheme.colors.accentStrong,
    accentSoft: gardenTheme.colors.accentSoft,
    border: gardenTheme.colors.border,
    sale: gardenTheme.colors.clay,
    saleSoft: gardenTheme.colors.claySoft,
    overlay: gardenTheme.colors.overlay,
    rose: gardenTheme.colors.rose,
    white: gardenTheme.colors.white,
  },
  radius: {
    sm: gardenTheme.radii.sm,
    md: gardenTheme.radii.md,
    lg: gardenTheme.radii.lg,
    xl: gardenTheme.radii.xl,
    pill: gardenTheme.radii.pill,
  },
  space: gardenTheme.spacing,
  shadows: gardenTheme.shadows,
};

// ─── Product Image Carousel ───────────────────────────────────────────────────
const ProductImageCarousel = ({ images, onCardPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const urls = getOrderedProductImageUrls(images);
  const validImages = urls.length > 0;

  if (!validImages || urls.length === 0) {
    return (
      <TouchableOpacity onPress={onCardPress} activeOpacity={0.85} style={styles.noImage}>
        <Icon name="local-florist" size={40} color={THEME.colors.muted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.imageCarouselContainer}>
      <TouchableOpacity onPress={onCardPress} activeOpacity={0.85} style={{ flex: 1 }}>
        <Image source={{ uri: urls[currentIndex] }} style={styles.productImage} resizeMode="cover" />
      </TouchableOpacity>

      {urls.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.carouselArrow, styles.carouselArrowLeft]}
            onPress={() => setCurrentIndex(p => (p === 0 ? urls.length - 1 : p - 1))}
            activeOpacity={0.7}
          >
            <Icon name="chevron-left" size={20} color={THEME.colors.white} />
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.carouselArrow, styles.carouselArrowRight]}
            onPress={() => setCurrentIndex(p => (p === urls.length - 1 ? 0 : p + 1))}
            activeOpacity={0.7}
          >
            <Icon name="chevron-right" size={20} color={THEME.colors.white} />
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
          <View style={styles.imageIndicatorContainer} pointerEvents="none">
            {urls.map((_, i) => (
              <View key={i} style={[styles.imageIndicatorDot, i === currentIndex && styles.imageIndicatorDotActive]} />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// ─── Star Rating Component ───────────────────────────────────────────────────
const StarRating = ({ rating, size = 12, showRating = false }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <View style={styles.starRatingContainer}>
      <View style={styles.starsRow}>
        {[...Array(fullStars)].map((_, i) => (
          <Icon key={`full-${i}`} name="star" size={size} color="#E5B93B" />
        ))}
        {halfStar && <Icon name="star-half" size={size} color="#E5B93B" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Icon key={`empty-${i}`} name="star-border" size={size} color="#C8CEC2" />
        ))}
      </View>
      {showRating && <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>}
    </View>
  );
};

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({ message, opacity }) => (
  <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
    <Text style={styles.toastText}>{message}</Text>
  </Animated.View>
);

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [user,             setUser]             = useState(null);
  const [products,         setProducts]         = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortAscending,    setSortAscending]    = useState(false);
  const [showCategories,   setShowCategories]   = useState(false);
  const [cart,             setCart]             = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [toastMessage,     setToastMessage]     = useState('');
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
  // Review states
  const [productReviews, setProductReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState({});

  const flatListRef    = useRef(null);
  const autoSlideTimer = useRef(null);
  const toastOpacity   = useRef(new Animated.Value(0)).current;
  const notificationListener = useRef(null);
  const notificationResponseListener = useRef(null);

  const fetchUnreadNotificationCount = useCallback(async () => {
    try {
      const token = await getToken();

      if (!token) {
        setUnreadNotificationCount(0);
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/users/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: 'ORDER_STATUS_UPDATE' },
          timeout: 5000,
        }
      );

      setUnreadNotificationCount(response.data?.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      setUnreadNotificationCount(0);
    }
  }, []);

  const availableCategories = useMemo(() => {
    const dynamicCategories = products
      .map(product => product?.category)
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);

    return dynamicCategories.length ? ['All', ...dynamicCategories] : CATEGORIES;
  }, [products]);

  const heroMetrics = useMemo(() => ([
    { label: 'Collections', value: Math.max(availableCategories.length - 1, 0) },
    { label: 'In cart', value: cart.length },
    { label: 'On sale', value: products.filter(product => product?.isOnSale).length },
  ]), [availableCategories.length, cart.length, products]);

  useEffect(() => {
    loadInitialData();
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  useEffect(() => { 
    filterAndSortProducts(); 
  }, [products, selectedCategory, searchQuery, sortAscending]);

  useEffect(() => {
    if (BANNERS.length > 1) startAutoSlide();
    return () => stopAutoSlide();
  }, [currentBannerIndex]);

  // Fetch reviews for all products when products are loaded
  useEffect(() => {
    if (products.length > 0) {
      fetchAllProductReviews();
    }
  }, [products]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      fetchUnreadNotificationCount();
    });

    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        fetchUnreadNotificationCount();
      });

    return () => {
      notificationListener.current?.remove();
      notificationResponseListener.current?.remove();
    };
  }, [fetchUnreadNotificationCount]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadNotificationCount();
    }, [fetchUnreadNotificationCount])
  );

  const startAutoSlide = () => {
    stopAutoSlide();
    if (BANNERS.length <= 1) return;

    autoSlideTimer.current = setInterval(() => {
      setCurrentBannerIndex(prev => {
        const next = (prev + 1) % BANNERS.length;
        flatListRef.current?.scrollToOffset({ offset: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 4200);
  };

  const stopAutoSlide = () => {
    if (autoSlideTimer.current) { clearInterval(autoSlideTimer.current); autoSlideTimer.current = null; }
  };

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (idx !== currentBannerIndex) setCurrentBannerIndex(idx);
  };

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (message) => {
    const normalizedMessage = message
      .replace(/^âœ…\s*"?/, '')
      .replace(/" added to cart!$/, ' added to cart.')
      .replace(/^âŒ\s*/, '');

    setToastMessage(normalizedMessage);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const loadInitialData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
      const token = await getToken();
      if (!token) { navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); return; }
      await Promise.all([fetchProducts(), fetchCart(), fetchUnreadNotificationCount()]);
    } catch (e) {
      console.error('Error loading initial data:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => { 
    setRefreshing(true); 
    await loadInitialData(); 
    await fetchAllProductReviews(); // Refresh reviews as well
    setRefreshing(false); 
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/products`, { timeout: 5000 });
      if (res.data?.success) {
        setProducts(res.data.products || []);
        setFilteredProducts(res.data.products || []);
      }
    } catch (e) { 
      console.error('Error fetching products:', e.message);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  const fetchCart = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${BACKEND_URL}/api/v1/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      if (res.data.success && res.data.cart) setCart(res.data.cart.items || []);
    } catch (e) { 
      console.error('Error fetching cart:', e);
      setCart([]);
    }
  };

  // ── Fetch reviews for all products ────────────────────────────────────────
  const fetchAllProductReviews = async () => {
    if (!products || products.length === 0) return;
    
    const reviewPromises = products.map(product => 
      fetchProductReviews(product._id)
    );
    
    await Promise.all(reviewPromises);
  };

  const fetchProductReviews = async (productId) => {
    try {
      setLoadingReviews(prev => ({ ...prev, [productId]: true }));
      
      const response = await axios.get(`${BACKEND_URL}/api/v1/reviews?productId=${productId}`, { timeout: 3000 });
      
      if (response.data.success) {
        setProductReviews(prev => ({ 
          ...prev, 
          [productId]: response.data.reviews || [] 
        }));
      }
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      setProductReviews(prev => ({ ...prev, [productId]: [] }));
    } finally {
      setLoadingReviews(prev => ({ ...prev, [productId]: false }));
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];
    if (selectedCategory !== 'All') filtered = filtered.filter(p => p.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }
    
    // Sort products - if sorting by price, use the actual selling price (discounted if on sale)
    filtered.sort((a, b) => {
      const priceA = a.isOnSale && a.discountedPrice ? parseFloat(a.discountedPrice) : parseFloat(a.price || 0);
      const priceB = b.isOnSale && b.discountedPrice ? parseFloat(b.discountedPrice) : parseFloat(b.price || 0);
      return sortAscending ? priceA - priceB : priceB - priceA;
    });
    
    setFilteredProducts(filtered);
  };

  // ── Calculate average rating for a product ───────────────────────────────
  const getProductAverageRating = (productId) => {
    const reviews = productReviews[productId] || [];
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return sum / reviews.length;
  };

  // ── POST /api/v1/cart/add — shows toast, updates local cart badge ─────────
  const handleAddToCart = async (product) => {
    try {
      const token = await getToken();
      if (!token) { navigation.navigate('Login'); return; }

      const res = await axios.post(
        `${BACKEND_URL}/api/v1/cart/add`,
        { productId: product._id },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCart(res.data.cart.items || []);
        showToast(`✅ "${product.name}" added to cart!`);
      }
    } catch (e) {
      console.error('Error adding to cart:', e);
      showToast(`❌ ${e.response?.data?.message || e.message}`);
    }
  };

  // Updated Buy Now to go directly to Checkout
  const handleBuyNow = (product) => {
    navigation.navigate('Checkout', {
      productId: product._id,
      quantity: 1,
      product: {
        ...product,
        // Pass the effective price
        effectivePrice: product.isOnSale && product.discountedPrice ? product.discountedPrice : product.price
      },
    });
  };

  const handleProductPress = (product) => navigation.navigate('SingleProduct', { productId: product._id });
  const toggleSort         = () => setSortAscending(p => !p);
  const selectCategory     = (cat) => { setSelectedCategory(cat); setShowCategories(false); };

  // ─── Render helpers ───────────────────────────────────────────────────────
  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerImageFrame}>
        <Image source={item.image} style={styles.bannerImage} />
        <View style={styles.bannerShade} />
        <View style={styles.bannerContent}>
          <View style={styles.bannerBadge}>
            <Icon name="yard" size={16} color={THEME.colors.white} />
            <Text style={styles.bannerBadgeText}>Garden edit</Text>
          </View>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
    </View>
  );

  const renderProductItem = ({ item }) => {
    // Determine which price to display
    const displayPrice = item.isOnSale && item.discountedPrice 
      ? parseFloat(item.discountedPrice).toFixed(2) 
      : parseFloat(item.price || 0).toFixed(2);
    
    const originalPrice = item.isOnSale && item.discountedPrice 
      ? parseFloat(item.price).toFixed(2) 
      : null;

    // Get product reviews and average rating
    const averageRating = getProductAverageRating(item._id);
    const reviewCount = (productReviews[item._id] || []).length;
    const isLoadingReview = loadingReviews[item._id];

    return (
      <View style={styles.productCard}>
        <View style={styles.imageContainer}>
          <ProductImageCarousel images={item.images} onCardPress={() => handleProductPress(item)} />
        </View>

        <TouchableOpacity onPress={() => handleProductPress(item)} activeOpacity={0.85}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productCategory} numberOfLines={1}>{item.category || 'Garden pick'}</Text>
            
            {/* Rating Display */}
            <View style={styles.reviewSummaryContainer}>
              {!isLoadingReview && reviewCount > 0 ? (
                <>
                  <StarRating rating={averageRating} size={12} showRating={true} />
                  <Text style={styles.reviewCount}>({reviewCount})</Text>
                </>
              ) : isLoadingReview ? (
                <ActivityIndicator size="small" color={THEME.colors.accent} style={styles.reviewLoader} />
              ) : (
                <Text style={styles.reviewPlaceholder}>New arrival</Text>
              )}
            </View>
            
            {/* Price with discount display */}
            <View style={styles.priceContainer}>
              {item.isOnSale && item.discountedPrice ? (
                <>
                  <Text style={styles.originalPrice}>₱{originalPrice}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>
                      {item.discountPercentage ? `${item.discountPercentage}% OFF` : 'SALE'}
                    </Text>
                  </View>
                  <Text style={styles.discountedPrice}>₱{displayPrice}</Text>
                </>
              ) : (
                <Text style={styles.productPrice}>₱{displayPrice}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.82}
            accessibilityLabel={`Add ${item.name} to cart`}
          >
            <Icon name="add-shopping-cart" size={18} color={THEME.colors.accentDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyNow(item)} activeOpacity={0.82}>
            <Text style={styles.buyButtonText}>Bring Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedCategory === item && styles.selectedCategoryItem]}
      onPress={() => selectCategory(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.categoryItemText, selectedCategory === item && styles.selectedCategoryItemText]}>
        {item}
      </Text>
      {selectedCategory === item && <Icon name="check" size={18} color={THEME.colors.accent} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.accent} />
      </View>
    );
  }

  return (
    <UserDrawer>
      <View style={styles.container}>
        <View pointerEvents="none" style={styles.backgroundArt}>
          <View style={[styles.backgroundOrb, styles.backgroundOrbTop]} />
          <View style={[styles.backgroundOrb, styles.backgroundOrbBottom]} />
        </View>

        <Header
          variant="home"
          user={user}
          onPressProfile={() => navigation.navigate('Profile')}
          onPressNotifications={() => navigation.navigate('OrderNotification')}
          notificationCount={unreadNotificationCount}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.colors.accentDark}
              colors={[THEME.colors.accentDark]}
            />
          }
        >
          <View style={styles.heroSection}>
            <View style={styles.heroPanel}>
              <View style={styles.heroPanelBadge}>
                <Icon name="park" size={16} color={THEME.colors.accentDark} />
                <Text style={styles.heroPanelBadgeText}>Garden marketplace</Text>
              </View>
              <Text style={styles.heroPanelTitle}>
                Build a greener home with plants, care tools, and soft botanical details.
              </Text>
              <Text style={styles.heroPanelSubtitle}>
                Explore a calmer shopping experience designed around growing, styling, and caring for your space.
              </Text>
              <View style={styles.heroMetricsRow}>
                {heroMetrics.map(metric => (
                  <View key={metric.label} style={styles.heroMetricCard}>
                    <Text style={styles.heroMetricValue}>{metric.value}</Text>
                    <Text style={styles.heroMetricLabel}>{metric.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.bannerWrapper}>
            <FlatList
              ref={flatListRef}
              data={BANNERS}
              renderItem={renderBannerItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              onScrollBeginDrag={stopAutoSlide}
              onScrollEndDrag={startAutoSlide}
              scrollEventThrottle={16}
            />
            <View style={styles.indicatorContainer}>
              {BANNERS.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    flatListRef.current?.scrollToOffset({ offset: idx * SCREEN_WIDTH, animated: true });
                    setCurrentBannerIndex(idx);
                  }}
                >
                  <View style={[styles.indicator, currentBannerIndex === idx && styles.activeIndicator]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.discoverySection}>
            <View style={styles.productsHeader}>
              <View>
                <Text style={styles.productsEyebrow}>Curated today</Text>
                <Text style={styles.productsTitle}>Garden picks for every corner</Text>
              </View>
              <Text style={styles.resultsCount}>{filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}</Text>
            </View>

            <View style={styles.discoveryBar}>
              <View style={styles.searchContainer}>
                <Icon name="search" size={20} color={THEME.colors.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search plants, tools, and garden care..."
                  placeholderTextColor={THEME.colors.muted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearButton}>
                    <Icon name="close" size={18} color={THEME.colors.muted} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.discoveryActions}>
                <TouchableOpacity
                  style={[styles.filterChip, selectedCategory !== 'All' && styles.filterChipActive]}
                  onPress={() => setShowCategories(true)}
                  activeOpacity={0.82}
                >
                  <Icon
                    name="category"
                    size={18}
                    color={selectedCategory !== 'All' ? THEME.colors.accentDark : THEME.colors.muted}
                    style={styles.filterLeadIcon}
                  />
                  <Text style={[styles.filterChipText, selectedCategory !== 'All' && styles.filterChipTextActive]} numberOfLines={1}>
                    {selectedCategory}
                  </Text>
                  <Icon name="expand-more" size={18} color={THEME.colors.muted} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.filterChip} onPress={toggleSort} activeOpacity={0.82}>
                  <Icon name="swap-vert" size={18} color={THEME.colors.muted} style={styles.filterLeadIcon} />
                  <Text style={styles.filterChipText} numberOfLines={1}>
                    {sortAscending ? 'Low to High' : 'High to Low'}
                  </Text>
                </TouchableOpacity>

                {(searchQuery.length > 0 || selectedCategory !== 'All') && (
                  <TouchableOpacity
                    style={styles.resetChip}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    activeOpacity={0.82}
                  >
                    <Icon name="close" size={16} color={THEME.colors.muted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {filteredProducts.length > 0 ? (
            <View style={styles.productsGrid}>
              {filteredProducts.map(item => (
                <View key={item._id} style={styles.gridItem}>
                  {renderProductItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="yard" size={54} color={THEME.colors.accentDark} />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try a different search term or category to explore more items.</Text>
            </View>
          )}
        </ScrollView>

        <Toast message={toastMessage} opacity={toastOpacity} />

        <Modal visible={showCategories} transparent animationType="fade" onRequestClose={() => setShowCategories(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCategories(false)}>
            <View style={styles.categoriesDropdown}>
              <Text style={styles.categoriesTitle}>Select Category</Text>
              <FlatList
                data={availableCategories}
                renderItem={renderCategoryItem}
                keyExtractor={(_, i) => i.toString()}
                style={styles.categoriesList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </UserDrawer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.bg },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 34 },
  backgroundArt: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundOrb: {
    position: 'absolute',
    borderRadius: THEME.radius.pill,
  },
  backgroundOrbTop: {
    width: 240,
    height: 240,
    top: -84,
    right: -74,
    backgroundColor: 'rgba(220,234,215,0.82)',
  },
  backgroundOrbBottom: {
    width: 210,
    height: 210,
    bottom: 18,
    left: -68,
    backgroundColor: 'rgba(248,232,216,0.72)',
  },
  toast: {
    position: 'absolute',
    bottom: 92,
    left: 18,
    right: 18,
    backgroundColor: 'rgba(23,49,31,0.94)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  toastText: { color: THEME.colors.white, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  heroSection: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  heroPanel: {
    padding: 22,
    borderRadius: THEME.radius.xl,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.medium,
  },
  heroPanelBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radius.pill,
    backgroundColor: THEME.colors.surfaceGlow,
    marginBottom: 16,
  },
  heroPanelBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroPanelTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color: THEME.colors.text,
  },
  heroPanelSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: THEME.colors.muted,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  heroMetricCard: {
    minWidth: 108,
    flex: 1,
    padding: 14,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  heroMetricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.accentDark,
  },
  heroMetricLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  discoverySection: {
    marginHorizontal: THEME.space.lg,
    marginBottom: THEME.space.md,
  },
  discoveryBar: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.soft,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceAlt,
    minHeight: 52,
    paddingHorizontal: THEME.space.md,
    borderRadius: THEME.radius.pill,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  searchIcon: { marginRight: 10, color: THEME.colors.muted },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: THEME.colors.text },
  searchClearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
  },
  discoveryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  bannerWrapper: {
    height: 286,
    marginTop: 0,
    marginBottom: THEME.space.lg,
    position: 'relative',
  },
  bannerContainer: { width: SCREEN_WIDTH, height: BANNER_HEIGHT },
  bannerImageFrame: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: THEME.radius.xl,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  bannerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18,28,17,0.34)',
  },
  bannerContent: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    padding: 18,
    borderRadius: THEME.radius.lg,
    backgroundColor: 'rgba(20,34,22,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginBottom: 12,
  },
  bannerBadgeText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    color: THEME.colors.white,
  },
  bannerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.92)',
  },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.55)', marginHorizontal: 4 },
  activeIndicator: { backgroundColor: '#FFFFFF', width: 18, height: 6, borderRadius: 4 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceAlt,
    paddingHorizontal: THEME.space.md,
    minHeight: 44,
    borderRadius: THEME.radius.pill,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    flex: 1,
  },
  filterChipActive: {
    backgroundColor: THEME.colors.accentSoft,
    borderColor: '#CFE3CF',
  },
  filterLeadIcon: { marginRight: 10 },
  filterChipText: { flex: 1, fontSize: 13, color: THEME.colors.text, fontWeight: '700' },
  filterChipTextActive: { color: THEME.colors.accentDark },
  resetChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: THEME.space.md,
  },
  productsEyebrow: {
    fontSize: 12,
    color: THEME.colors.accentDark,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productsTitle: { fontSize: 22, fontWeight: '900', color: THEME.colors.text, marginTop: 4 },
  resultsCount: { fontSize: 13, fontWeight: '800', color: THEME.colors.muted },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: THEME.space.md },
  gridItem: { width: '50%', paddingHorizontal: 6 },
  productCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 22,
    marginBottom: THEME.space.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    minHeight: 344,
    ...THEME.shadows.soft,
    overflow: 'hidden',
  },
  imageContainer: { height: 164, backgroundColor: THEME.colors.surfaceAlt },
  imageCarouselContainer: { width: '100%', height: '100%', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  noImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.surfaceAlt },
  carouselArrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -16 }],
    backgroundColor: 'rgba(23,49,31,0.5)',
    borderRadius: 16,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  carouselArrowLeft: {
    left: 8,
  },
  carouselArrowRight: {
    right: 8,
  },
  arrowText: { fontSize: 0, lineHeight: 0, color: 'transparent' },
  imageIndicatorContainer: { position: 'absolute', bottom: 6, width: '100%', flexDirection: 'row', justifyContent: 'center' },
  imageIndicatorDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)', marginHorizontal: 2 },
  imageIndicatorDotActive: { backgroundColor: '#FFFFFF', width: 7, height: 7 },
  productInfo: { paddingHorizontal: THEME.space.md, paddingTop: THEME.space.md, paddingBottom: 12, minHeight: 126 },
  productName: { fontSize: 15, lineHeight: 20, fontWeight: '900', color: THEME.colors.text, marginBottom: 6, minHeight: 40 },
  productCategory: { fontSize: 11, color: THEME.colors.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.35 },
  productPrice: { fontSize: 17, fontWeight: '900', color: THEME.colors.accentDark },
  reviewSummaryContainer: { flexDirection: 'row', alignItems: 'center', minHeight: 18, marginBottom: 10 },
  starRatingContainer: { flexDirection: 'row', alignItems: 'center' },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 11, color: THEME.colors.muted, marginLeft: 4, fontWeight: '800' },
  reviewCount: { fontSize: 10, color: THEME.colors.muted, marginLeft: 4 },
  reviewLoader: { alignSelf: 'flex-start' },
  reviewPlaceholder: { fontSize: 11, fontWeight: '800', color: THEME.colors.muted, textTransform: 'uppercase', letterSpacing: 0.35 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', minHeight: 42, marginTop: 2 },
  originalPrice: { fontSize: 12, color: THEME.colors.muted, textDecorationLine: 'line-through', marginRight: 6 },
  discountedPrice: { width: '100%', marginTop: 4, fontSize: 17, fontWeight: '900', color: THEME.colors.accentDark },
  discountBadge: {
    backgroundColor: THEME.colors.saleSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.radius.pill,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#F3D6B8',
  },
  discountBadgeText: { color: THEME.colors.sale, fontSize: 10, fontWeight: '800' },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: THEME.space.md,
    paddingTop: 2,
    paddingBottom: THEME.space.md,
  },
  cartButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceGlow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  buyButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.text,
    borderRadius: 14,
  },
  buyButtonText: { fontSize: 12, fontWeight: '900', color: THEME.colors.white, letterSpacing: 0.25 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 42,
    paddingHorizontal: THEME.space.lg,
    marginHorizontal: THEME.space.lg,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.soft,
  },
  emptyText: { fontSize: 18, fontWeight: '800', color: THEME.colors.text, marginTop: 15, marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: THEME.colors.muted, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(23,49,31,0.38)', justifyContent: 'flex-start', paddingTop: 120 },
  categoriesDropdown: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginHorizontal: THEME.space.lg,
    maxHeight: 420,
    ...THEME.shadows.medium,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
    paddingHorizontal: THEME.space.md,
    paddingTop: THEME.space.md,
    paddingBottom: THEME.space.sm,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  categoriesList: { maxHeight: 360 },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: THEME.space.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  selectedCategoryItem: { backgroundColor: THEME.colors.accentSoft },
  categoryItemText: { fontSize: 15, color: THEME.colors.text },
  selectedCategoryItemText: { color: THEME.colors.accentDark, fontWeight: '800' },
});


