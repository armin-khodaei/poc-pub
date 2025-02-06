import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getSignatureRequests,
  downloadSignedDocument,
  type SignatureRequest,
} from "@/lib/api";

type Status = "COMPLETED" | "IN-PROGRESS" | "EXPIRED";

const statusStyles: Record<Status, { color: string; label: string }> = {
  COMPLETED: { color: "bg-green-100 text-green-800", label: "Completed" },
  "IN-PROGRESS": { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  EXPIRED: { color: "bg-red-100 text-red-800", label: "Expired" },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function SignatureRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getSignatureRequests();
        if (response.success && response.data) {
          setRequests(response.data);
        } else {
          setError(response.error || "Failed to fetch signature requests");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleDownload = async (signatureRequestId: string) => {
    try {
      const response = await downloadSignedDocument(signatureRequestId);
      window.open(response.data.url, "_blank");
    } catch (err) {
      console.error("Failed to download document:", err);
    }
  };

  const handleSign = (request: SignatureRequest) => {
    navigate("/signing", {
      state: {
        documentId: request.id,
      },
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Signature Requests</CardTitle>
            <CardDescription>
              View and manage all your signature requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No signature requests found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Created Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{request.title}</td>
                        <td className="py-3 px-4">
                          {formatDate(request.created_date)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              statusStyles[request.status as Status].color
                            }
                            variant="outline"
                          >
                            {statusStyles[request.status as Status].label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {request.status === "COMPLETED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(request.id)}
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          ) : request.status === "IN-PROGRESS" ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleSign(request)}
                              className="gap-2"
                            >
                              <PenLine className="h-4 w-4" />
                              Sign Now
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
