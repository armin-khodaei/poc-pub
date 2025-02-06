import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPartnershipAgreement } from "@/lib/api";

interface PartnershipFormData {
  partnerName: string;
  partnerEmail: string;
  agreementFile: File | null;
}

const initialFormData: PartnershipFormData = {
  partnerName: "",
  partnerEmail: "",
  agreementFile: null,
};

export function PartnershipForm() {
  const navigate = useNavigate();
  const [formData, setFormData] =
    useState<PartnershipFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.partnerName.trim()) {
      newErrors.partnerName = "Partner name is required";
    }

    if (!formData.partnerEmail.trim()) {
      newErrors.partnerEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.partnerEmail)) {
      newErrors.partnerEmail = "Invalid email format";
    }

    if (!formData.agreementFile) {
      newErrors.agreementFile = "Agreement file is required";
    } else if (!formData.agreementFile.type.includes("pdf")) {
      newErrors.agreementFile = "Only PDF files are allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await createPartnershipAgreement(formData);
        if (response.success && response.data) {
          navigate("/signing", {
            state: {
              documentId: response.data.id,
              signerEmail: formData.partnerEmail,
              signerName: formData.partnerName,
            },
          });
        } else {
          setErrors((prev) => ({
            ...prev,
            submit: response.error || "Failed to create agreement",
          }));
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          submit: "An unexpected error occurred",
        }));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      const file = e.target.files?.[0] || null;
      setFormData((prev) => ({
        ...prev,
        agreementFile: file,
      }));

      if (errors.agreementFile) {
        setErrors((prev) => ({
          ...prev,
          agreementFile: "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Partnership Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">Partner Name</Label>
                <Input
                  id="partnerName"
                  name="partnerName"
                  placeholder="Enter partner name"
                  value={formData.partnerName}
                  onChange={handleChange}
                  required
                />
                {errors.partnerName && (
                  <p className="text-sm text-red-500">{errors.partnerName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnerEmail">Partner Email</Label>
                <Input
                  id="partnerEmail"
                  name="partnerEmail"
                  type="email"
                  placeholder="Enter partner email"
                  value={formData.partnerEmail}
                  onChange={handleChange}
                  required
                />
                {errors.partnerEmail && (
                  <p className="text-sm text-red-500">{errors.partnerEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="agreementFile">Upload Agreement (PDF)</Label>
                <Input
                  id="agreementFile"
                  name="agreementFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleChange}
                  required
                  className="cursor-pointer"
                />
                {errors.agreementFile && (
                  <p className="text-sm text-red-500">{errors.agreementFile}</p>
                )}
                {formData.agreementFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {formData.agreementFile.name}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full">
              Submit and Sign
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
