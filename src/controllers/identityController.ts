import { Request, Response, NextFunction } from 'express';
import { IdentityService } from '../services/identityService';
import { IdentifyRequest } from '../types';

const identityService = new IdentityService();

export const identityController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, phoneNumber }: IdentifyRequest = req.body;

    if (!email && !phoneNumber) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'At least one of email or phoneNumber must be provided'
      });
      return;
    }

    if (email && !isValidEmail(email)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid email format'
      });
      return;
    }

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid phone number format'
      });
      return;
    }

    const result = await identityService.identifyContact(email, phoneNumber);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in identity controller:', error);
    next(error);
  }
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanedPhone) && cleanedPhone.length >= 6;
}
