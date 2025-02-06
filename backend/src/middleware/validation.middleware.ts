import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

export const validateSignatureRequest = (req: Request, res: Response, next: NextFunction) => {
  let contractType: string;
  let formData: any;

  // Handle both FormData and JSON formats
  if (req.is('multipart/form-data')) {
    contractType = req.body.contractType;
    try {
      formData = JSON.parse(req.body.formData);
    } catch (error) {
      throw new ValidationError('Invalid form data format');
    }
  } else {
    // JSON format
    contractType = req.body.contractType;
    formData = req.body.formData;
  }

  if (!contractType) {
    throw new ValidationError('Contract type is required');
  }

  if (!['freelance', 'rental', 'template', 'employee', 'partnership'].includes(contractType)) {
    throw new ValidationError('Invalid contract type');
  }

  if (!formData) {
    throw new ValidationError('Form data is required');
  }

  if (typeof formData !== 'object') {
    throw new ValidationError('Form data must be an object');
  }

  validateFormData(contractType, formData);
  next();
};

function validateFormData(contractType: string, formData: any) {
  const requiredFields: Record<string, string[]> = {
    freelance: ['clientName', 'clientEmail', 'projectName', 'startDate', 'endDate'],
    rental: ['tenantName', 'tenantEmail'],
    template: ['templateId', 'contractorName', 'contractorEmail'],
    employee: ['clientName', 'sendingMethod'],
    partnership: ['partnerName', 'partnerEmail'],
  };

  const missingFields = requiredFields[contractType].filter(field => !formData[field]);

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields for ${contractType}: ${missingFields.join(', ')}`
    );
  }

  // Validate email fields
  const emailFields = Object.keys(formData).filter(field => field.toLowerCase().includes('email'));
  emailFields.forEach(field => {
    if (!isValidEmail(formData[field])) {
      throw new ValidationError(`Invalid email format for ${field}`);
    }
  });
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
