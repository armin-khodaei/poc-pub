import axios from 'axios';
import { config } from '../config';
import { AuthService } from './auth.service';
import { BadRequestError } from '../utils/errors';
import * as fs from 'fs';
import * as path from 'path';

interface UploadDocumentResponse {
  document_name: string;
}

export class DocumentService {
  private static instance: DocumentService;
  private authService: AuthService;
  private readonly filesDirectory: string;

  private constructor() {
    this.authService = AuthService.getInstance();
    this.filesDirectory = path.join(__dirname, '../../files');
  }

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  async uploadPremadeDocument(
    filename: string,
    targetFilename: string
  ): Promise<UploadDocumentResponse> {
    try {
      const filePath = path.join(this.filesDirectory, filename);
      if (!fs.existsSync(filePath)) {
        throw new BadRequestError(`Template ${filename} not found`);
      }

      const fileBuffer = fs.readFileSync(filePath);
      const accessToken = await this.authService.getAccessToken();

      const formData = new FormData();
      formData.append(
        'document',
        new Blob([fileBuffer], {
          type: 'application/pdf',
        }),
        targetFilename
      );

      const response = await axios.post<UploadDocumentResponse>(
        `${config.signit.apiUrl}/documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  async uploadDocument(
    file: Express.Multer.File,
    targetFilename: string
  ): Promise<UploadDocumentResponse> {
    try {
      const accessToken = await this.authService.getAccessToken();
      const fileBuffer = fs.readFileSync(file.path);

      const formData = new FormData();
      formData.append(
        'document',
        new Blob([fileBuffer], {
          type: 'application/pdf',
        }),
        targetFilename
      );

      const response = await axios.post<UploadDocumentResponse>(
        `${config.signit.apiUrl}/documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  getAvailableTemplates(): string[] {
    try {
      return fs
        .readdirSync(this.filesDirectory)
        .filter(file => file.toLowerCase().endsWith('_template.pdf'));
    } catch (error) {
      throw new Error('Failed to read templates directory');
    }
  }
}
