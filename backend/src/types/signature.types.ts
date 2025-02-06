export interface SignatureRequest {
  title: string;
  message: string;
  expire_in: number;
  signers: Signer[];
  metadata?: Record<string, any>;
}

export interface Signer {
  name: string;
  email: string;
  role: string;
}

export interface FormData {
  // Common fields
  contractType: string;
  
  // Freelance specific
  clientName?: string;
  clientEmail?: string;
  projectName?: string;
  
  // Rental specific
  landlordName?: string;
  landlordEmail?: string;
  tenantName?: string;
  tenantEmail?: string;
  propertyAddress?: string;
  
  // NDA specific
  disclosingParty?: string;
  disclosingPartyEmail?: string;
  receivingParty?: string;
  receivingPartyEmail?: string;
} 