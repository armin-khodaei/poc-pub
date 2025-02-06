const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://poc-pub-api.onrender.com/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Signatory {
  id: string;
  full_name: string;
  email: string;
  status?: string;
}

export interface SignatureRequest {
  id: string;
  title: string;
  created_date: string;
  status: "COMPLETED" | "IN-PROGRESS" | "EXPIRED";
  signatories: Signatory[];
  document_name: string;
}

export interface CreateSignatureRequest {
  title: string;
  signerName: string;
  signerEmail: string;
  contractType?: string;
  projectName?: string;
  startDate?: string;
  endDate?: string;
  paymentAmount?: string;
  sendingMethod?: string;
  phoneNumber?: string;
}

// Generic error handler
const handleApiError = (error: any): ApiResponse<any> => {
  console.error("API Error:", error);
  return {
    success: false,
    error: error.message || "An unexpected error occurred",
  };
};

// Generic API call wrapper
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return { success: true, data };
  } catch (error) {
    return handleApiError(error);
  }
};

// Create a new signature request
export const createSignatureRequest = async (
  requestData: CreateSignatureRequest
): Promise<ApiResponse<SignatureRequest>> => {
  return apiCall<SignatureRequest>("/signatures/create", {
    method: "POST",
    body: JSON.stringify({
      formData: {
        title: requestData.title,
        clientName: requestData.signerName,
        clientEmail: requestData.signerEmail,
        projectName: requestData.projectName,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        paymentAmount: requestData.paymentAmount,
        sendingMethod: requestData.sendingMethod,
        phoneNumber: requestData.phoneNumber,
      },
      contractType: requestData.contractType,
    }),

    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Get all signature requests
export const getSignatureRequests = async (): Promise<
  ApiResponse<SignatureRequest[]>
> => {
  return apiCall<SignatureRequest[]>("/signatures");
};

// Get a specific signature request
export const getSignatureRequest = async (
  id: string
): Promise<ApiResponse<SignatureRequest>> => {
  return apiCall<SignatureRequest>(`/signatures/${id}`);
};

// Download a signed document
export const downloadSignedDocument = async (
  documentUrl: string
): Promise<Blob> => {
  const response = await fetch(documentUrl);
  if (!response.ok) {
    throw new Error("Failed to download document");
  }
  return response.blob();
};

// Create a freelance agreement
export const createFreelanceAgreement = async (
  data: any
): Promise<ApiResponse<SignatureRequest>> => {
  return createSignatureRequest({
    title: `Freelance Agreement - ${data.clientName}`,
    signerName: data.clientName,
    signerEmail: data.clientEmail,
    contractType: data.contractType,
    projectName: data.projectName,
    startDate: data.startDate,
    endDate: data.endDate,
    paymentAmount: data.paymentAmount,
  });
};

// Create an employee agreement
export const createEmployeeAgreement = async (data: any) => {
  return apiCall("/signatures/create", {
    method: "POST",
    body: JSON.stringify({
      contractType: "employee",
      formData: {
        title: `Employee Agreement - ${data.fullName}`,
        clientName: data.fullName,
        sendingMethod: data.sendingMethod,
        phoneNumber: data.phoneNumber,
        clientEmail: data.email,
        needsVerification: data.needsVerification,
        verificationType: data.verificationType,
        nationalId: data.nationalId,
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const createRentalAgreement = async (data: any) => {
  const formData = new FormData();
  formData.append("contractType", "rental");
  formData.append("file", data.agreementFile);
  formData.append(
    "formData",
    JSON.stringify({
      title: `Rental Agreement - ${data.tenantName}`,
      tenantName: data.tenantName,
      tenantEmail: data.tenantEmail,
    })
  );
  return apiCall("/signatures/create", {
    method: "POST",
    body: formData,
  });
};

// Create a contractor agreement
export const createContractorAgreement = async (
  data: any
): Promise<ApiResponse<SignatureRequest>> => {
  return apiCall("/signatures/create", {
    method: "POST",
    body: JSON.stringify({
      contractType: "template",
      formData: {
        title: `Contractor Agreement - ${data.contractorName}`,
        contractorName: data.contractorName,
        contractorEmail: data.contractorEmail,
        templateId: data.templateId,
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Create a partnership agreement
export const createPartnershipAgreement = async (
  data: any
): Promise<ApiResponse<SignatureRequest>> => {
  console.log({ data });

  const formData = new FormData();
  formData.append("contractType", "partnership");
  formData.append("file", data.agreementFile);
  formData.append(
    "formData",
    JSON.stringify({
      title: `Partnership Agreement - ${data.businessName}`,
      businessName: data.businessName,
      partnerName: data.partnerName,
      partnerEmail: data.partnerEmail,
      description: data.description,
    })
  );
  return apiCall("/signatures/create", {
    method: "POST",
    body: formData,
  });
};

// Get signing link for a signatory
export const getSigningLink = async (
  requestId: string,
  signatoryId: string
): Promise<ApiResponse<{ signing_link: string }>> => {
  return apiCall<{ signing_link: string }>(
    `/signatures/${requestId}/signatories/${signatoryId}/signing-link`
  );
};
