import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SignitEmbedded from "@signitsa/signitsa-embedded";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSignatureRequest,
  getSigningLink,
  type SignatureRequest,
} from "@/lib/api";
import { useToast } from "./ui/use-toast";

interface SigningPageState {
  documentId: string;
}

export function SigningPage() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<SignatureRequest | null>(
    null
  );
  const state = location.state as SigningPageState;

  const client = new SignitEmbedded({
    clientId: "bfd31e119c8245f5a36716b7cbe5689f",
    debug: false,
    locale: SignitEmbedded.locales.EN_US,
    allowCancel: true,
  });

  useEffect(() => {
    if (!state?.documentId) {
      setError("Invalid signing session. Please try again.");
      return;
    }

    const fetchSigningSession = async () => {
      try {
        // First, fetch the signature request details
        const response = await getSignatureRequest(state.documentId);
        if (!response.success || !response.data) {
          throw new Error(
            response.error || "Failed to fetch signature request details"
          );
        }

        setRequestDetails(response.data);

        // Get the first signatory's ID
        const signatory = response.data.signatories[0];
        if (!signatory?.id) {
          throw new Error("No signatory found for this document");
        }

        // Then, fetch the signing link
        const linkResponse = await getSigningLink(
          state.documentId,
          signatory.id
        );
        if (!linkResponse.success || !linkResponse.data) {
          throw new Error(linkResponse.error || "Failed to get signing link");
        }

        if (containerRef.current) {
          client.open(linkResponse.data.signing_link, {
            container: containerRef.current,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }
    };

    fetchSigningSession();
  }, [state]);

  const handleCancel = () => {
    navigate("/");
  };

  client.on("sign", () => {
    toast({
      title: "Signature request signed",
      description: "The signature request has been signed successfully",
    });
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>{error}</p>
            <Button onClick={handleCancel} variant="outline" className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex p-4 gap-4">
      {/* Left side - Description */}
      <Card className="w-1/3 h-[80vh]">
        <CardHeader>
          <CardTitle>Signing Process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Step 1: Review Document</h3>
            <p className="text-muted-foreground">
              Carefully review the document contents before signing. Make sure
              all information is accurate and complete.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Step 2: Sign Document</h3>
            <p className="text-muted-foreground">
              Follow the prompts to place your electronic signature in the
              designated areas. You may need to click through multiple signature
              fields.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              Step 3: Confirm and Submit
            </h3>
            <p className="text-muted-foreground">
              Once you've completed all signature fields, review your signatures
              and submit the document to complete the process.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Right side - Signing Interface */}
      <Card className="w-2/3 h-[80vh]">
        <CardHeader className="border-b">
          <CardTitle>
            {requestDetails ? requestDetails.title : "Sign Document"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-5rem)]">
          <div
            className="h-full bg-slate-50 p-4"
            id="signit-container"
            ref={containerRef}
          ></div>
        </CardContent>
      </Card>
    </div>
  );
}
