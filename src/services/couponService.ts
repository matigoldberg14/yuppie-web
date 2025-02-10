// src/services/couponService.ts

import { prisma } from '../lib/prisma';
import { customAlphabet } from 'nanoid';
import { secureApiClient } from './secureApiClient';
import { createHash } from 'crypto';

// Use nanoid for secure, unpredictable coupon codes
const generateCouponCode = customAlphabet(
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZ',
  10
);

interface CreateCouponParams {
  restaurantId: string;
  discount: number;
  email: string;
  expiresAt: Date;
}

interface ValidateCouponParams {
  code: string;
  restaurantId: string;
  email: string;
}

export class CouponService {
  private static instance: CouponService;

  private constructor() {}

  static getInstance(): CouponService {
    if (!CouponService.instance) {
      CouponService.instance = new CouponService();
    }
    return CouponService.instance;
  }

  private hashEmail(email: string): string {
    return createHash('sha256').update(email.toLowerCase()).digest('hex');
  }

  async createCoupon({
    restaurantId,
    discount,
    email,
    expiresAt,
  }: CreateCouponParams): Promise<string> {
    // Validate input
    if (discount < 10 || discount > 100) {
      throw new Error('Invalid discount value');
    }

    const hashedEmail = this.hashEmail(email);

    // Check if user already has an active coupon
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        restaurantId,
        emailHash: hashedEmail,
        expiresAt: { gt: new Date() },
        used: false,
      },
    });

    if (existingCoupon) {
      throw new Error('User already has an active coupon');
    }

    // Generate unique coupon code
    let code: string;
    let isUnique = false;
    do {
      code = generateCouponCode();
      const existing = await prisma.coupon.findUnique({ where: { code } });
      isUnique = !existing;
    } while (!isUnique);

    // Create coupon with email hash
    await prisma.coupon.create({
      data: {
        code,
        restaurantId,
        discount,
        emailHash: hashedEmail,
        expiresAt,
        used: false,
      },
    });

    return code;
  }

  async validateCoupon({
    code,
    restaurantId,
    email,
  }: ValidateCouponParams): Promise<boolean> {
    const hashedEmail = this.hashEmail(email);

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        restaurantId,
        emailHash: hashedEmail,
        expiresAt: { gt: new Date() },
        used: false,
      },
    });

    return !!coupon;
  }

  async markCouponAsUsed(code: string): Promise<void> {
    await prisma.coupon.update({
      where: { code },
      data: { used: true, usedAt: new Date() },
    });
  }

  async getCouponDetails(code: string, restaurantId: string) {
    return await prisma.coupon.findFirst({
      where: {
        code,
        restaurantId,
      },
      select: {
        discount: true,
        expiresAt: true,
        used: true,
        usedAt: true,
      },
    });
  }
}

export const couponService = CouponService.getInstance();
