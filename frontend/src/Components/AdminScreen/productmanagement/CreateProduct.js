import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { getToken } from '../../../utils/helper';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AdminDrawer from '../AdminDrawer';

// Use Expo environment variable instead of @env
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const normalizePickedImage = (asset, index) => ({
  uri: asset.uri,
  file: asset.file || null,
  type: asset.mimeType || 'image/jpeg',
  name:
    asset.fileName ||
    asset.file?.name ||
    `product_${Date.now()}_${index}.jpg`,
});

const CreateProductContent = React.memo(({ 
  formData, 
  setFormData, 
  images, 
  setImages, 
  loading, 
  suppliers, 
  showCategoryModal, 
  setShowCategoryModal, 
  showSupplierModal, 
  setShowSupplierModal,
  handleSubmit,
  pickImage,
  removeImage,
  navigation
}) => {
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const getSelectedSupplierName = useCallback(() => {
    if (!formData.supplier) return 'No Supplier';
    const supplier = suppliers.find(s => s._id === formData.supplier);
    return supplier ? supplier.name : 'No Supplier';
  }, [formData.supplier, suppliers]);

  const categories = [
    'Pet Food',
    'Pet Accessories',
    'Pet Toys',
    'Health & Wellness',
    'Grooming Supplies',
    'Feeding Supplies',
    'Housing & Cages',
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Product Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholder="Enter product name"
        />

        <Text style={styles.label}>Price *</Text>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={(text) => handleInputChange('price', text)}
          placeholder="Enter price"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="Enter product description"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Category *</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={formData.category ? styles.pickerTextSelected : styles.pickerText}>
            {formData.category || 'Select a category'}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>Supplier (Optional)</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowSupplierModal(true)}
        >
          <Text style={formData.supplier ? styles.pickerTextSelected : styles.pickerText}>
            {getSelectedSupplierName()}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>Stock *</Text>
        <TextInput
          style={styles.input}
          value={formData.stock}
          onChangeText={(text) => handleInputChange('stock', text)}
          placeholder="Enter stock quantity"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Images * (Max 5)</Text>
        
        <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
          <Icon name="add-a-photo" size={24} color="#3498db" />
          <Text style={styles.imageUploadText}>Upload Images</Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <View style={styles.imageSection}>
            <FlatList
              horizontal
              data={images}
              keyExtractor={(item, index) => `image-${index}`}
              renderItem={({ item, index }) => (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: item.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Icon name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={styles.imageList}
            />
            <Text style={styles.imageCount}>
              Total: {images.length}/5 images
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Create Product</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    formData.category === item && styles.categoryItemSelected,
                  ]}
                  onPress={() => {
                    handleInputChange('category', item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.categoryText,
                    formData.category === item && styles.categoryTextSelected,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSupplierModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSupplierModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>Select Supplier</Text>
            
            <TouchableOpacity
              style={[
                styles.supplierItem,
                !formData.supplier && styles.supplierItemSelected,
              ]}
              onPress={() => {
                handleInputChange('supplier', '');
                setShowSupplierModal(false);
              }}
            >
              <Text style={[
                styles.supplierText,
                !formData.supplier && styles.supplierTextSelected,
              ]}>
                No Supplier
              </Text>
            </TouchableOpacity>

            {suppliers.length === 0 ? (
              <View style={styles.emptySuppliers}>
                <Text style={styles.emptySuppliersText}>
                  No suppliers available. Please add suppliers first.
                </Text>
              </View>
            ) : (
              <FlatList
                data={suppliers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.supplierItem,
                      formData.supplier === item._id && styles.supplierItemSelected,
                    ]}
                    onPress={() => {
                      handleInputChange('supplier', item._id);
                      setShowSupplierModal(false);
                    }}
                  >
                    <View style={styles.supplierInfo}>
                      <Text style={[
                        styles.supplierText,
                        formData.supplier === item._id && styles.supplierTextSelected,
                      ]}>
                        {item.name}
                      </Text>
                      {item.email && (
                        <Text style={[
                          styles.supplierEmail,
                          formData.supplier === item._id && styles.supplierEmailSelected,
                        ]}>
                          {item.email}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSupplierModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
});

export default function CreateProductScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [images, setImages] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    supplier: '',
    stock: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = await getToken();
      console.log('Fetching suppliers...');
      const res = await axios.get(`${BACKEND_URL}/api/v1/suppliers/dropdown`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Suppliers fetched:', res.data.suppliers?.length || 0);
      setSuppliers(res.data.suppliers || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      console.error('Error details:', error.response?.data);
      setSuppliers([]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uploadedImages = result.assets.map((asset, index) =>
        normalizePickedImage(asset, index)
      );
      
      const totalImages = images.length + uploadedImages.length;
      if (totalImages > 5) {
        Alert.alert('Limit Exceeded', 'Maximum 5 images allowed');
        return;
      }
      setImages([...images, ...uploadedImages]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Validation Error', 'Valid price is required');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Description is required');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Validation Error', 'Please select a category');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      Alert.alert('Validation Error', 'Valid stock quantity is required');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Validation Error', 'At least one image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await getToken();
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', parseInt(formData.stock));
      
      if (formData.supplier && formData.supplier !== '') {
        formDataToSend.append('supplier', formData.supplier);
      }

      for (const [index, image] of images.entries()) {
        const fileName = image.name || `product_${Date.now()}_${index}.jpg`;
        const mimeType = image.type || 'image/jpeg';

        if (Platform.OS === 'web') {
          if (image.file) {
            formDataToSend.append('images', image.file, fileName);
            continue;
          }

          const response = await fetch(image.uri);
          const blob = await response.blob();
          formDataToSend.append('images', blob, fileName);
          continue;
        }

        formDataToSend.append('images', {
          uri: image.uri,
          type: mimeType,
          name: fileName,
        });
      }

      console.log('Creating new product...');
      console.log('Form data:', {
        name: formData.name,
        supplier: formData.supplier || 'none',
        imagesCount: images.length
      });
      
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/admin/products`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      console.log('Product created successfully:', res.data);
      
      Alert.alert(
        'Success',
        'Product created successfully',
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('ProductList') 
        }]
      );
    } catch (error) {
      console.error('❌ Error creating product:', error);
      console.error('❌ Full error response:', error.response?.data);
      
      let errorMessage = 'Failed to create product. Please check all fields.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
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

  return (
    <AdminDrawer onLogout={handleLogout}>
      <CreateProductContent
        formData={formData}
        setFormData={setFormData}
        images={images}
        setImages={setImages}
        loading={loading}
        suppliers={suppliers}
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        showSupplierModal={showSupplierModal}
        setShowSupplierModal={setShowSupplierModal}
        handleSubmit={handleSubmit}
        pickImage={pickImage}
        removeImage={removeImage}
        navigation={navigation}
      />
    </AdminDrawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#999',
  },
  pickerTextSelected: {
    fontSize: 16,
    color: '#2c3e50',
  },
  imageSection: {
    marginBottom: 15,
  },
  imageUploadButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageUploadText: {
    color: '#3498db',
    marginTop: 5,
    fontWeight: 'bold',
  },
  imageList: {
    paddingVertical: 10,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
  },
  categoryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItemSelected: {
    backgroundColor: '#3498db',
  },
  categoryText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  supplierItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  supplierItemSelected: {
    backgroundColor: '#3498db',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  supplierTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  supplierEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  supplierEmailSelected: {
    color: '#e0e0e0',
  },
  emptySuppliers: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySuppliersText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalCloseButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
