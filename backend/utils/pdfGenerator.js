// backend/utils/pdfGenerator.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const PRIMARY_GREEN = '#2E7D32';
const SOFT_GREEN = '#E8F5E9';
const MID_GREEN = '#C8E6C9';
const TEXT_DARK = '#1E293B';
const TEXT_MUTED = '#475569';

const PESO_SIGN = '\u20B1';

const resolveFirstExistingPath = (candidates) =>
   candidates.find((candidate) => fs.existsSync(candidate)) || null;

const getUnicodeFonts = (doc) => {
   const regularFontPath = resolveFirstExistingPath([
      path.resolve(__dirname, '../assets/fonts/NotoSans-Regular.ttf'),
      'C:\\Windows\\Fonts\\arial.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
      '/Library/Fonts/Arial Unicode.ttf',
   ]);

   const boldFontPath = resolveFirstExistingPath([
      path.resolve(__dirname, '../assets/fonts/NotoSans-Bold.ttf'),
      'C:\\Windows\\Fonts\\arialbd.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
      '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
      '/Library/Fonts/Arial Bold.ttf',
   ]) || regularFontPath;

   if (regularFontPath) {
      doc.registerFont('SproutifyRegular', regularFontPath);
   }

   if (boldFontPath) {
      doc.registerFont('SproutifyBold', boldFontPath);
   }

   return {
      regular: regularFontPath ? 'SproutifyRegular' : 'Helvetica',
      bold: boldFontPath ? 'SproutifyBold' : 'Helvetica-Bold',
   };
};

const formatPeso = (amount) => `${PESO_SIGN}${Number(amount || 0).toFixed(2)}`;

/**
 * Generate PDF receipt for delivered orders using PDFKit
 * @param {Object} order - Order object
 * @param {Object} user - User object
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateReceiptPDF = (order, user) => {
   return new Promise((resolve, reject) => {
      try {
         const doc = new PDFDocument({
            margin: 40,
            size: 'A4'
         });
         const fonts = getUnicodeFonts(doc);
         const buffers = [];

         // Collect PDF data
         doc.on('data', buffers.push.bind(buffers));
         doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
         });
         doc.on('error', reject);

         // ===== HEADER SECTION =====
         // Company Header with background
         doc.rect(0, 0, doc.page.width, 100)
            .fill(PRIMARY_GREEN);

         doc.fillColor('#FFFFFF')
            .fontSize(24)
            .font(fonts.bold)
            .text('Sproutify', 50, 35);

         doc.fontSize(14)
            .text('Sproutify Order Receipt', 50, 65);

         // Receipt ID and Date
         doc.fontSize(10)
            .fillColor('#E5E7EB')
            .text(`Receipt #: ${order._id}`, 400, 40, { align: 'right' })
            .text(`Issue Date: ${new Date().toLocaleDateString()}`, 400, 55, { align: 'right' })
            .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 70, { align: 'right' });

         // ===== CUSTOMER & SHIPPING INFO SECTION =====
         let yPosition = 120;

         // Customer Information
         doc.fillColor(TEXT_DARK)
            .fontSize(12)
            .font(fonts.bold)
            .text('BILLED TO', 50, yPosition);

         doc.fillColor(TEXT_MUTED)
            .font(fonts.regular)
            .fontSize(10)
            .text(user.name, 50, yPosition + 20)
            .text(user.email, 50, yPosition + 35)
            .text(order.shippingInfo.phoneNo, 50, yPosition + 50);

         // Shipping Information
         doc.fillColor(TEXT_DARK)
            .font(fonts.bold)
            .text('SHIPPED TO', 300, yPosition);

         doc.fillColor(TEXT_MUTED)
            .font(fonts.regular)
            .text(order.shippingInfo.address, 300, yPosition + 20)
            .text(`${order.shippingInfo.city}, ${order.shippingInfo.country}`, 300, yPosition + 35)
            .text(order.shippingInfo.postalCode, 300, yPosition + 50);

         // ===== ORDER ITEMS TABLE =====
         yPosition += 80;

         // Table Header
         doc.fillColor('#FFFFFF')
            .rect(50, yPosition, 500, 25)
            .fill(PRIMARY_GREEN);

         doc.font(fonts.bold)
            .fontSize(11)
            .text('PRODUCT', 65, yPosition + 8)
            .text('QTY', 350, yPosition + 8, { width: 40, align: 'center' })
            .text('UNIT PRICE', 400, yPosition + 8, { width: 70, align: 'right' })
            .text('TOTAL', 480, yPosition + 8, { width: 60, align: 'right' });

         yPosition += 25;

         // Order Items
         order.orderItems.forEach((item, index) => {
            const rowY = yPosition + (index * 25);

            // Alternate row colors
            if (index % 2 === 0) {
               doc.rect(50, rowY, 500, 25)
                  .fill(SOFT_GREEN);
            }

            doc.fillColor(TEXT_DARK)
               .font(fonts.regular)
               .fontSize(10)
               .text(item.name, 65, rowY + 8, { width: 270 })
               .text(item.quantity.toString(), 350, rowY + 8, { width: 40, align: 'center' })
               .text(formatPeso(item.price), 400, rowY + 8, { width: 70, align: 'right' })
               .text(formatPeso(item.quantity * item.price), 480, rowY + 8, { width: 60, align: 'right' });
         });

         // ===== TOTALS SECTION =====
         const itemsEndY = yPosition + (order.orderItems.length * 25) + 30;

         // Subtotal
         doc.fillColor(TEXT_MUTED)
            .font(fonts.regular)
            .fontSize(11)
            .text('Subtotal:', 400, itemsEndY)
            .text(formatPeso(order.itemsPrice), 480, itemsEndY, { align: 'right' });

         // Tax
         doc.text('Tax:', 400, itemsEndY + 15)
            .text(formatPeso(order.taxPrice), 480, itemsEndY + 15, { align: 'right' });

         // Shipping
         doc.text('Shipping:', 400, itemsEndY + 30)
            .text(formatPeso(order.shippingPrice), 480, itemsEndY + 30, { align: 'right' });

         // Total with separator line
         doc.moveTo(400, itemsEndY + 45)
            .lineTo(540, itemsEndY + 45)
            .strokeColor(MID_GREEN)
            .stroke();

         doc.fillColor(TEXT_DARK)
            .font(fonts.bold)
            .fontSize(14)
            .text('TOTAL:', 400, itemsEndY + 55)
            .fillColor(PRIMARY_GREEN)
            .text(formatPeso(order.totalPrice), 480, itemsEndY + 55, { align: 'right' });

         // ===== DELIVERY INFORMATION =====
         const deliveryY = itemsEndY + 90;

         doc.fillColor(TEXT_DARK)
            .font(fonts.bold)
            .fontSize(12)
            .text('DELIVERY INFORMATION', 50, deliveryY);

         doc.rect(50, deliveryY + 15, 500, 30)
            .fill(SOFT_GREEN)
            .stroke(MID_GREEN);

         doc.fillColor(TEXT_MUTED)
            .font(fonts.regular)
            .fontSize(10)
            .text(`Order Status: ${order.orderStatus}`, 65, deliveryY + 25);

         if (order.deliveredAt) {
            doc.text(`Delivered On: ${new Date(order.deliveredAt).toLocaleString()}`, 300, deliveryY + 25);
         }

         // ===== FOOTER SECTION =====
         const footerY = doc.page.height - 60;

         // Thank you message
         doc.fillColor(PRIMARY_GREEN)
            .fontSize(12)
            .font(fonts.bold)
            .text('Thank you for your purchase!', 50, footerY, { align: 'center' });

         doc.fillColor('#64748B')
            .fontSize(9)
            .font(fonts.regular)
            .text('This is an computer-generated receipt. No signature required.', 50, footerY + 15, { align: 'center' })
            .text('For questions, contact: support@sproutify.com', 50, footerY + 30, { align: 'center' });

         doc.end();
      } catch (error) {
         reject(error);
      }
   });
};

module.exports = { generateReceiptPDF };
