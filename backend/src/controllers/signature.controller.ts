import { Request, Response } from 'express';
import { ApiClient } from '../utils/api-client';
import { BadRequestError } from '../utils/errors';
import { SignatureService } from '../services/signature.service';
import { DocumentService } from '../services/document.service';
import dayjs from 'dayjs';

export class SignatureController {
  private apiClient: ApiClient;
  private signatureService: SignatureService;
  private documentService: DocumentService;

  constructor() {
    this.apiClient = ApiClient.getInstance();
    this.signatureService = SignatureService.getInstance();
    this.documentService = DocumentService.getInstance();
  }

  async getSignatureRequests(req: Request, res: Response) {
    try {
      const response = await this.apiClient.client.get('/signature-requests', {
        params: {
          current_page: req.query.page || 1,
          page_size: req.query.per_page || 10,
          order_by: 'created_date',
          order_direction: 'desc',
          signature_request_type: 'embedded',
        },
      });
      const requests = response.data.map((request: any) => ({
        id: request.id,
        title: request.title,
        created_date: request.created_date,
        status: request.status,
      }));

      res.json(requests);
    } catch (error: any) {
      throw new BadRequestError(`Failed to fetch signature requests: ${error.message}`);
    }
  }

  async getSignatureRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await this.apiClient.client.get(`/signature-requests/${id}`);

      const request = {
        id: response.data.id,
        title: response.data.title,
        created_date: response.data.created_date,
        status: response.data.status,
        signatories: response.data.signatories,
        document_name: response.data.document_name,
      };

      res.json(request);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new BadRequestError('Signature request not found');
      }
      throw new BadRequestError(`Failed to fetch signature request: ${error.message}`);
    }
  }

  async updateSignatureRequestStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new BadRequestError('Status is required');
      }

      if (!['pending', 'completed'].includes(status)) {
        throw new BadRequestError('Invalid status value');
      }

      await this.apiClient.client.patch(`/signature-requests/${id}`, { status });
      res.json({ message: 'Status updated successfully' });
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new BadRequestError('Signature request not found');
      }
      throw new BadRequestError(`Failed to update signature request status: ${error.message}`);
    }
  }

  async createSignatureRequest(req: Request, res: Response) {
    try {
      let contractType: string;
      let formData: any;
      let result;

      // Handle both FormData and JSON formats
      if (req.is('multipart/form-data')) {
        // FormData format
        const file = req.file;
        contractType = req.body.contractType;
        formData = JSON.parse(req.body.formData);

        if (!file && (contractType === 'rental' || contractType === 'partnership')) {
          throw new BadRequestError('File is required for this contract type');
        }

        if (file && (contractType === 'rental' || contractType === 'partnership')) {
          // For rental contracts with uploaded file
          result = await this.documentService.uploadDocument(file, file.originalname);
        } else {
          // Use template for other types
          const templateFile = `${contractType}_template.pdf`;
          result = await this.documentService.uploadPremadeDocument(templateFile, templateFile);
        }
      } else {
        // JSON format
        contractType = req.body.contractType;
        formData = req.body.formData;

        if (contractType === 'template') {
          const templateData = this.prepareTemplateData(formData);
          const response = await this.apiClient.client.post(
            `/templates/${formData.templateId}/signature-requests`,
            templateData
          );
          return res.json({
            success: true,
            id: response.data.id,
            createdAt: response.data.created_date,
          });
        }

        // Use template file
        const templateFile = `${contractType}_template.pdf`;
        result = await this.documentService.uploadPremadeDocument(templateFile, templateFile);
      }

      // Validate required fields
      if (!contractType || !formData) {
        throw new BadRequestError('Contract type and form data are required');
      }

      // Prepare the signature request data based on contract type
      const signatureRequestData = this.prepareDocumentData(contractType, formData);

      // Create the embedded signature request
      const response = await this.apiClient.client.post('/signature-requests/embedded', {
        ...signatureRequestData,
        document_name: result.document_name,
      });

      // Return the response with the signature request details
      res.json({
        success: true,
        id: response.data.id,
        title: response.data.title,
        status: response.data.status,
        createdAt: response.data.created_date,
      });
    } catch (error: any) {
      if (error.response) {
        res.status(500).json({
          success: false,
          error: error.response.data,
        });
        return;
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }
  private prepareTemplateData(formData: any) {
    return {
      name: 'Signature Request From Templates',
      roles: [
        {
          role: 'Contractor',
          name: formData.contractorName,
          notification_method: {
            email: formData.contractorEmail,
          },
          verification_method: {
            email: formData.contractorEmail,
          },
        },
      ],
    };
  }

  private prepareDocumentData(contractType: string, formData: any) {
    try {
      // Base request structure with title based on contract type
      const signature_request = {
        signature_request: {
          title: formData.title,
          signatories: this.prepareSigners(contractType, formData),
        },
      };
      return signature_request;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }

  private createFreelanceSignatory(formData: any) {
    return [
      {
        full_name: formData.clientName,
        verification_method: {
          email: formData.clientEmail,
        },
        notification_method: {
          email: formData.clientEmail,
        },
        fields: [
          {
            kind: 'signature_date',
            position: {
              x: 392,
              y: 666,
              width: 112,
              height: 20,
              page: 1,
            },
            properties: {
              required: false,
              read_only: true,
              prefilled_value: dayjs(formData.startDate).format('DD/MM/YYYY'),
            },
          },
          {
            kind: 'name',
            position: {
              x: 237,
              y: 652,
              width: 120,
              height: 20,
              page: 1,
            },
            properties: {
              required: false,
              read_only: true,
              prefilled_value: formData.clientName,
            },
          },

          {
            kind: 'text_field',
            position: {
              x: 114,
              y: 556,
              width: 260,
              height: 20,
              page: 1,
            },
            properties: {
              required: false,
              read_only: true,
              prefilled_value: formData.projectName,
            },
          },
          {
            kind: 'signature_date',
            position: {
              x: 292,
              y: 443,
              width: 116,
              height: 20,
              page: 1,
            },
            properties: {
              required: false,
              read_only: true,
              prefilled_value: dayjs(formData.startDate).format('DD/MM/YYYY'),
            },
          },
          {
            kind: 'signature_date',
            position: {
              x: 131,
              y: 423,
              width: 120,
              height: 20,
              page: 1,
            },
            properties: {
              required: false,
              read_only: true,
              prefilled_value: dayjs(formData.endDate).format('DD/MM/YYYY'),
            },
          },
          {
            kind: 'text_field',
            position: {
              x: 234,
              y: 354,
              width: 144,
              height: 20,
              page: 1,
            },
            properties: {
              required: false,
              read_only: true,
              prefilled_value: `$${formData.paymentAmount}`,
            },
          },
          {
            kind: 'signature',
            position: {
              x: 73,
              y: 448,
              width: 120,
              height: 30,
              page: 3,
            },
            properties: {
              required: true,
            },
          },
          {
            kind: 'name',
            position: {
              x: 110,
              y: 383,
              width: 180,
              height: 30,
              page: 3,
            },
            properties: {
              required: true,
            },
          },
          {
            kind: 'email',
            position: {
              x: 110,
              y: 343,
              width: 180,
              height: 30,
              page: 3,
            },
            properties: {
              required: true,
            },
          },
          {
            kind: 'signature_date',
            position: {
              x: 110,
              y: 304,
              width: 80,
              height: 30,
              page: 3,
            },
            properties: {
              required: true,
            },
          },
        ],
      },
    ];
  }

  private prepareSigners(contractType: string, formData: any) {
    switch (contractType) {
      case 'freelance':
        return this.createFreelanceSignatory(formData);
      case 'rental':
        return [
          {
            full_name: formData.tenantName,
            verification_method: {
              email: formData.tenantEmail,
            },
            notification_method: {
              email: formData.tenantEmail,
            },
            fields: [
              {
                kind: 'signature_date',
                position: {
                  page: 1,
                  x: 368,
                  y: 676,
                  width: 80,
                  height: 20,
                },
                properties: {
                  read_only: true,
                  required: false,
                },
              },
              {
                kind: 'name',
                position: {
                  page: 1,
                  x: 175,
                  y: 655,
                  width: 150,
                  height: 30,
                },
                properties: {
                  required: false,
                  read_only: true,
                  prefilled_value: formData.tenantName,
                },
              },
              {
                kind: 'signature',
                position: {
                  page: 1,
                  x: 119,
                  y: 100,
                  width: 110,
                  height: 20,
                },
                properties: {
                  required: true,
                },
              },
              {
                kind: 'signature_date',
                position: {
                  page: 1,
                  x: 118,
                  y: 69,
                  width: 110,
                  height: 20,
                },
                properties: {
                  required: false,
                  read_only: true,
                },
              },
            ],
          },
        ];

      case 'template':
        return [
          {
            full_name: formData.contractorName,
            verification_method: {
              email: formData.contractorEmail,
            },
            notification_method: {
              email: formData.contractorEmail,
            },
          },
        ];
      case 'employee':
        return this.createEmployeeSignatory(formData);
      case 'partnership':
        return this.createPartnershipSignatory(formData);
      default:
        throw new Error(`Unsupported contract type: ${contractType}`);
    }
  }

  private createPartnershipSignatory(formData: any) {
    return [
      {
        full_name: formData.partnerName,
        verification_method: {
          email: formData.partnerEmail,
        },
        notification_method: {
          email: formData.partnerEmail,
        },
        fields: [
          {
            kind: 'signature_date',
            position: {
              anchor_tag: '[Signing Date]',
            },
            properties: {
              read_only: true,
              required: false,
              prefilled_value: dayjs().format('DD/MM/YYYY'),
            },
          },
          {
            kind: 'signature',
            position: {
              anchor_tag: formData.partnerName,
              y_offset: -40,
              width: 140,
              height: 30,
            },
            properties: {
              required: true,
            },
          },
        ],
      },
    ];
  }

  private createEmployeeSignatory(formData: any) {
    return [
      {
        full_name: formData.clientName,
        notification_method: {
          [formData.sendingMethod]: formData.clientEmail
            ? formData.clientEmail
            : formData.phoneNumber,
        },
        ...(formData.needsVerification
          ? {
              verification_method: {
                [formData.verificationType]:
                  formData.verificationType === 'nafath' ? true : formData.nationalId,
              },
            }
          : {
              verification_method: {
                [formData.sendingMethod]: formData.clientEmail
                  ? formData.clientEmail
                  : formData.phoneNumber,
              },
            }),

        fields: [
          {
            kind: 'name',
            position: {
              x: 100,
              y: 637,
              width: 118,
              height: 20,
              page: 1,
            },
            properties: {
              required: true,
            },
          },
          {
            kind: 'signature',
            position: {
              x: 73,
              y: 305,
              width: 120,
              height: 30,
              page: 2,
            },
            properties: {
              required: true,
            },
          },
          {
            kind: 'name',
            position: {
              x: 133,
              y: 238,
              width: 180,
              height: 30,
              page: 2,
            },
            properties: {
              required: true,
            },
          },
          {
            kind: 'email',
            position: {
              x: 133,
              y: 206,
              width: 180,
              height: 30,
              page: 2,
            },
            properties: {
              required: true,
            },
          },
          {
            kind: 'signature_date',
            position: {
              x: 133,
              y: 178,
              width: 80,
              height: 30,
              page: 2,
            },
            properties: {
              required: true,
            },
          },
        ],
      },
    ];
  }

  async generateSigningLink(req: Request, res: Response) {
    try {
      const { id, signatoryId } = req.params;

      if (!id || !signatoryId) {
        throw new BadRequestError('Signature request ID and signatory ID are required');
      }

      const response = await this.apiClient.client.get(
        `/signature-requests/${id}/signatories/${signatoryId}/signing-link`
      );

      res.json({
        signing_link: response.data.url,
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new BadRequestError('Signature request or signatory not found');
      }
      throw new BadRequestError(`Failed to generate signing link: ${error.message}`);
    }
  }
}
