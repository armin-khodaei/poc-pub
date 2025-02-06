import {
  FileSignature,
  Users,
  FileText,
  Handshake,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UseCaseCard } from "./UseCaseCard";

const useCases = [
  {
    title: "Freelance Agreement",
    description:
      "Create a professional agreement between a freelancer and client with clear terms, deliverables, and payment schedules.",
    icon: FileSignature,
    tags: [
      "Embedded signing",
      "Place fields in specific locations",
      "Pre-set document uploaded",
      "Autofill based on form input",
    ],
  },
  {
    title: "Employee Onboarding",
    description:
      "Streamline your employee onboarding process with digital offer letters and employment contracts.",
    icon: Users,
    tags: [
      "Send using Email/SMS/WhatsApp",
      "Adapt to user input",
      "Pre-set document uploaded",
      "Place fields in specific locations",
      "Absher",
      "Nafath",
      "NafathApp",
    ],
  },
  {
    title: "Rental Agreement",
    description:
      "Create and manage property rental agreements with automated signing and verification.",
    icon: Building2,
    tags: [
      "Custom document upload",
      "Pre-fill signer info based on form input",
      "Embedded signing",
    ],
  },
  {
    title: "Contractor Agreement",
    description:
      "Protect your confidential information with a legally binding non-disclosure agreement.",
    icon: FileText,
    tags: [
      "Send using a pre-saved template",
      "List available templates",
      "pre-fill based on form input",
      "Embedded signing",
    ],
  },
  {
    title: "Partnership Agreement",
    description:
      "Establish clear terms and conditions for business partnerships with comprehensive agreements.",
    icon: Handshake,
    tags: [
      "Custom document upload",
      "pre-fill based on form input",
      "Place fields in specific locations",
      "Auto-position fields",
    ],
  },
  {
    title: "List Signature Requests",
    description:
      "View and manage all your signature requests. Track status, download completed documents, and monitor progress.",
    icon: CheckCircle2,
    tags: [
      "List signature requests",
      "Track status for each request",
      "Download or take action on each request",
    ],
  },
];

const features = [
  "Send signature requests",
  "Embedded signing",
  "Auto-position fields",
  "Send using a saved template",
  "Send by uplading a document",
  "List signature requests",
  "Get status updates",
];

export function Home() {
  const navigate = useNavigate();

  const handleCardClick = (title: string) => {
    switch (title) {
      case "Freelance Agreement":
        navigate("/freelance");
        break;
      case "Employee Onboarding":
        navigate("/employee");
        break;
      case "Contractor Agreement":
        navigate("/contractor");
        break;
      case "Rental Agreement":
        navigate("/rental");
        break;
      case "Partnership Agreement":
        navigate("/partnership");
        break;
      case "List Signature Requests":
        navigate("/requests");
        break;
      default:
        console.log(`${title} functionality not implemented yet`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Enhanced Patterns */}
      <div className="relative overflow-hidden bg-[#0F172A] py-24">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />

        <div className="container mx-auto relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              Signit eSignatures, Straight into Your Workflow
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Explore real-world scenarios and discover the powerful features of
              Signit API that will elevate your users’ document signing
              experience; fast, secure, and fully compliant.
            </p>

            {/* Features List */}
            <div className="flex flex-wrap justify-center gap-3">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Grid */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="transform transition-all duration-300 hover:-translate-y-1"
            >
              <UseCaseCard
                {...useCase}
                onClick={() => handleCardClick(useCase.title)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
