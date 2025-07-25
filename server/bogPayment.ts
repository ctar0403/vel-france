import crypto from 'crypto';

// BOG Payment API interfaces based on official documentation
export interface BOGCreateOrderRequest {
  callback_url: string;
  external_order_id?: string;
  purchase_units: {
    currency?: string; // GEL, USD, EUR, GBP - defaults to GEL
    total_amount: number;
    basket: {
      product_id: string;
      description?: string;
      quantity: number;
      unit_price: number;
      unit_discount_price?: number;
      vat?: number;
      vat_percent?: number;
      total_price?: number;
      image?: string;
      package_code?: string;
      tin?: string;
      pinfl?: string;
      product_discount_id?: string;
    }[];
    delivery?: {
      amount?: number;
    };
    total_discount_amount?: number;
  };
  redirect_urls?: {
    success?: string;
    fail?: string;
  };
  ttl?: number; // minutes (2-1440, default 15)
  payment_method?: string[]; // card, google_pay, apple_pay, bog_p2p, bog_loyalty, bnpl, bog_loan, gift_card
  bnpl?: boolean; // true = installments only, false = standard only, undefined = both
  capture?: 'automatic' | 'manual'; // defaults to automatic
  buyer?: {
    full_name?: string;
    masked_email?: string;
    masked_phone?: string;
  };
  application_type?: 'web' | 'mobile';
  config?: {
    loan?: {
      amount?: number;
      month?: number;
      discount_code?: string;
    };
  };
}

export interface BOGCreateOrderResponse {
  id: string; // order_id
  _links: {
    details: {
      href: string; // API endpoint to get payment details
    };
    redirect: {
      href: string; // URL to redirect customer for payment
    };
  };
}

export interface BOGTokenResponse {
  access_token: string;
  token_type: string; // "Bearer"
  expires_in: number;
}

class BOGPaymentService {
  // Correct BOG Payment API endpoints based on official documentation
  private authUrl = 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token';
  private apiBaseUrl = 'https://api.bog.ge/payments/v1';
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor() {
    // Use official BOG Payment API credentials
    this.clientId = '10001216';
    this.clientSecret = 'vNx6Sx1bge5g';
    
    console.log('Using BOG Payment API credentials - Client ID:', this.clientId, 'Merchant ID: 00000000981292N');
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // HTTP Basic Auth: base64 encode client_id:client_secret
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch(this.authUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('BOG API Response:', errorText);
        throw new Error(`BOG token request failed: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response from BOG API:', responseText);
        throw new Error('BOG API returned non-JSON response');
      }

      const tokenData: BOGTokenResponse = await response.json();
      
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000; // Subtract 1 minute for safety
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting BOG access token:', error);
      throw error;
    }
  }

  async createOrder(orderRequest: BOGCreateOrderRequest): Promise<BOGCreateOrderResponse> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.apiBaseUrl}/ecommerce/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'en', // English interface
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('BOG Order Creation Error:', errorText);
        throw new Error(`BOG order creation failed: ${response.status} - ${errorText}`);
      }

      const orderData: BOGCreateOrderResponse = await response.json();
      return orderData;
    } catch (error) {
      console.error('Error creating BOG order:', error);
      throw error;
    }
  }

  async getOrderDetails(orderId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.apiBaseUrl}/receipt/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BOG order details retrieval failed: ${response.status} - ${errorText}`);
      }

      const orderData = await response.json();
      return orderData;
    } catch (error) {
      console.error('Error retrieving BOG order details:', error);
      throw error;
    }
  }

  getPaymentUrl(orderResponse: BOGCreateOrderResponse): string {
    return orderResponse._links.redirect.href;
  }

  getDetailsUrl(orderResponse: BOGCreateOrderResponse): string {
    return orderResponse._links.details.href;
  }
}

export const bogPaymentService = new BOGPaymentService();