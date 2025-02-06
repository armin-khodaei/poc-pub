import axios from 'axios';
import { config } from '../config';
import { AuthService } from './auth.service';
import { DocumentService } from './document.service';

export class SignatureService {
  private static instance: SignatureService;
  private authService: AuthService;
  private documentService: DocumentService;

  private constructor() {
    this.authService = AuthService.getInstance();
    this.documentService = DocumentService.getInstance();
  }

  static getInstance(): SignatureService {
    if (!SignatureService.instance) {
      SignatureService.instance = new SignatureService();
    }
    return SignatureService.instance;
  }

  async createSignatureRequest(file: Express.Multer.File, filename: string, signers: any[]) {
    try {
      // First upload the document
      const uploadedDoc = await this.documentService.uploadDocument(file, filename);

      // Then create signature request using the uploaded document
      const accessToken = await this.authService.getAccessToken();

      const response = await axios.post(
        `${config.signit.apiUrl}/signature-requests`,
        {
          document_name: uploadedDoc.document_name,
          signers,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create signature request: ${error.message}`);
    }
  }
}
