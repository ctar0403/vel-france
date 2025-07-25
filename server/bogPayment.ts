import crypto from 'crypto';

export interface BOGPaymentRequest {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: {
    amount: {
      currency_code: string;
      value: string;
    };
  }[];
  items?: {
    product_id: string;
    name: string;
    quantity: number;
    unit_amount: {
      currency_code: string;
      value: string;
    };
  }[];
  shop_order_id?: string;
  callback_url?: string;
}

export interface BOGPaymentResponse {
  status: 'CREATED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  payment_hash: string;
  order_id: string;
  links: {
    rel: string;
    href: string;
    method: string;
  }[];
}

export interface BOGTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class BOGPaymentService {
  private baseUrl = 'https://ipay.ge/opay/api/v1';
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor() {
    // Use updated BOG credentials
    this.clientId = '15391';
    this.clientSecret = 'mUjYHjNZKd6N';
    
    console.log('Using updated BOG credentials with client ID:', this.clientId);
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/oauth2/token`, {
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

  async createPayment(paymentRequest: BOGPaymentRequest): Promise<BOGPaymentResponse> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('BOG Payment Creation Error:', errorText);
        throw new Error(`BOG payment creation failed: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON payment response from BOG API:', responseText);
        throw new Error('BOG API returned non-JSON payment response');
      }

      const paymentData: BOGPaymentResponse = await response.json();
      return paymentData;
    } catch (error) {
      console.error('Error creating BOG payment:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<BOGPaymentResponse> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/checkout/orders/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BOG payment retrieval failed: ${response.status} - ${errorText}`);
      }

      const paymentData: BOGPaymentResponse = await response.json();
      return paymentData;
    } catch (error) {
      console.error('Error retrieving BOG payment:', error);
      throw error;
    }
  }

  async capturePayment(paymentId: string): Promise<BOGPaymentResponse> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/checkout/payment/${paymentId}/pre-auth/completion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BOG payment capture failed: ${response.status} - ${errorText}`);
      }

      const paymentData: BOGPaymentResponse = await response.json();
      return paymentData;
    } catch (error) {
      console.error('Error capturing BOG payment:', error);
      throw error;
    }
  }

  getApprovalUrl(paymentResponse: BOGPaymentResponse): string | null {
    const approvalLink = paymentResponse.links.find(link => link.rel === 'approve');
    return approvalLink ? approvalLink.href : null;
  }
}

export const bogPaymentService = new BOGPaymentService();