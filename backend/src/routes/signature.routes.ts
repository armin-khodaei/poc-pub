import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { SignatureController } from '../controllers/signature.controller';
import { validateSignatureRequest } from '../middleware/validation.middleware';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const signatureController = new SignatureController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../files/uploads');
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get all signature requests
router.get('/', signatureController.getSignatureRequests.bind(signatureController));

// Get signature request by ID
router.get('/:id', signatureController.getSignatureRequestById.bind(signatureController));

// Update signature request status
router.patch(
  '/:id/status',
  signatureController.updateSignatureRequestStatus.bind(signatureController)
);

// Generate signing link
router.get(
  '/:id/signatories/:signatoryId/signing-link',
  signatureController.generateSigningLink.bind(signatureController)
);
router.get('/:id/download', signatureController.downloadSignedDocument.bind(signatureController));

// Create signature request endpoint with support for both FormData and JSON
router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) => {
    if (req.is('application/json')) {
      return next();
    }
    return upload.single('file')(req as any, res as any, next);
  },
  validateSignatureRequest,
  signatureController.createSignatureRequest.bind(signatureController)
);

export default router;
