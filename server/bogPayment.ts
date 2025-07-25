import crypto from 'crypto';

export interface BOGPaymentRequest {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: {
    amount: {
      currency_code: string;
      value: string;
    };
    reference_id?: string;
    description?: string;
  }[];
  redirect_urls: {
    success_url: string;
    cancel_url: string;
  };
  locale?: string;
}

export interface BOGPaymentResponse {
  id: string;
  status: 'CREATED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
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
  private baseUrl = 'https://api.bog.ge';
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor() {
    this.clientId = process.env.BOG_CLIENT_ID!;
    this.clientSecret = process.env.BOG_CLIENT_SECRET!;
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('BOG_CLIENT_ID and BOG_CLIENT_SECRET must be provided');
    }
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
        throw new Error(`BOG token request failed: ${response.status} - ${errorText}`);
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
      
      const response = await fetch(`${this.baseUrl}/payments/v1/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BOG payment creation failed: ${response.status} - ${errorText}`);
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
      
      const response = await fetch(`${this.baseUrl}/payments/v1/payment/${paymentId}`, {
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
      
      const response = await fetch(`${this.baseUrl}/payments/v1/payment/${paymentId}/capture`, {
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
    const approvalLink = paymentResponse.links.find(link => link.rel === 'approval_url');
    return approvalLink ? approvalLink.href : null;
  }
}

export const bogPaymentService = new BOGPaymentService();