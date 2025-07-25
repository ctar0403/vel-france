// Mock service for testing BOG payments when API is not available
import crypto from 'crypto';
import type { BOGPaymentRequest, BOGPaymentResponse } from './bogPayment';

export class BOGMockService {
  private payments = new Map<string, any>();

  async createPayment(paymentRequest: BOGPaymentRequest): Promise<BOGPaymentResponse> {
    const paymentId = crypto.randomUUID();
    
    const payment = {
      id: paymentId,
      status: 'CREATED',
      amount: paymentRequest.purchase_units[0].amount,
      reference_id: paymentRequest.purchase_units[0].reference_id,
      created_at: new Date().toISOString(),
      links: [
        {
          rel: 'approval_url',
          href: `${paymentRequest.redirect_urls.success_url.split('/payment/success')[0]}/mock-payment?paymentId=${paymentId}`,
          method: 'GET'
        }
      ]
    };

    this.payments.set(paymentId, payment);

    return {
      id: paymentId,
      status: 'CREATED',
      links: payment.links
    };
  }

  async getPayment(paymentId: string): Promise<BOGPaymentResponse> {
    const payment = this.payments.get(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    return {
      id: paymentId,
      status: 'COMPLETED', // Simulate successful payment
      links: payment.links
    };
  }

  getApprovalUrl(paymentResponse: BOGPaymentResponse): string | null {
    const approvalLink = paymentResponse.links.find(link => link.rel === 'approval_url');
    return approvalLink ? approvalLink.href : null;
  }
}

export const bogMockService = new BOGMockService();