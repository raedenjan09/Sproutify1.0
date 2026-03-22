const isPlaceholderUrl = (url) =>
  typeof url === 'string' &&
  (/placehold\.co/i.test(url) || /via\.placeholder\.com/i.test(url));

const normalizeImage = (image) => {
  if (!image) {
    return null;
  }

  if (typeof image === 'string') {
    return {
      raw: image,
      url: image,
    };
  }

  if (image.url) {
    return {
      raw: image,
      url: image.url,
    };
  }

  return null;
};

export const getOrderedProductImages = (images = []) =>
  images
    .map(normalizeImage)
    .filter(Boolean)
    .sort((a, b) => Number(isPlaceholderUrl(a.url)) - Number(isPlaceholderUrl(b.url)))
    .map((image) => image.raw);

export const getOrderedProductImageUrls = (images = []) =>
  getOrderedProductImages(images)
    .map((image) => (typeof image === 'string' ? image : image?.url))
    .filter(Boolean);

export const getPreferredProductImageUrl = (images = []) =>
  getOrderedProductImageUrls(images)[0] || null;
