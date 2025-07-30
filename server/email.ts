import nodemailer from 'nodemailer';

// Create a transporter using Gmail (free option)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
    },
  });
};

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  paymentMethod: string;
}

export async function sendOrderNotificationEmail(orderData: OrderEmailData): Promise<boolean> {
  try {
    // Skip email sending if credentials are not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log('Email credentials not configured, skipping email notification');
      return true; // Return true to not break the order flow
    }

    const transporter = createTransporter();
    
    const itemsList = orderData.items
      .map(item => `• ${item.productName} x${item.quantity} - ₾${item.price.toFixed(2)}`)
      .join('\n');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Send to admin email or fallback to sender
      subject: `New Order #${orderData.orderId} - Vel France`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">New Order Received!</h2>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #2d3748;">Order Details</h3>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Customer:</strong> ${orderData.customerName}</p>
            <p><strong>Email:</strong> ${orderData.customerEmail}</p>
            <p><strong>Total Amount:</strong> ₾${orderData.totalAmount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
          </div>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #2d3748;">Items Ordered</h3>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${itemsList}</pre>
          </div>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #2d3748;">Shipping Address</h3>
            <p style="white-space: pre-wrap;">${orderData.shippingAddress}</p>
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #edf2f7; border-radius: 10px;">
            <p style="margin: 0; color: #4a5568;">
              This order was placed on Vel France perfume store. Please process this order promptly.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order notification email sent for order ${orderData.orderId}`);
    return true;
  } catch (error) {
    console.error('Failed to send order notification email:', error);
    return false; // Don't fail the order if email fails
  }
}

export async function sendOrderConfirmationToCustomer(orderData: OrderEmailData): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log('Email credentials not configured, skipping customer confirmation email');
      return true;
    }

    const transporter = createTransporter();
    
    const itemsList = orderData.items
      .map(item => `• ${item.productName} x${item.quantity} - ₾${item.price.toFixed(2)}`)
      .join('\n');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: orderData.customerEmail,
      subject: `Order Confirmation #${orderData.orderId} - Vel France`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Thank you for your order!</h2>
          
          <p>Dear ${orderData.customerName},</p>
          <p>We've received your order and are preparing it for shipment. Here are your order details:</p>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #2d3748;">Order #${orderData.orderId}</h3>
            <p><strong>Total Amount:</strong> ₾${orderData.totalAmount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
          </div>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #2d3748;">Items Ordered</h3>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${itemsList}</pre>
          </div>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #2d3748;">Shipping Address</h3>
            <p style="white-space: pre-wrap;">${orderData.shippingAddress}</p>
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #edf2f7; border-radius: 10px;">
            <p style="margin: 0; color: #4a5568;">
              <strong>Delivery Information:</strong><br>
              • Tbilisi: 1-2 business days<br>
              • Regions: 2-3 business days
            </p>
          </div>

          <p style="margin-top: 20px;">
            Thank you for choosing Vel France!<br>
            <strong>I/E PERFUMETRADE NETWORK</strong><br>
            Tbilisi, Vaja Pshavela 70g
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to customer for order ${orderData.orderId}`);
    return true;
  } catch (error) {
    console.error('Failed to send customer confirmation email:', error);
    return false;
  }
}