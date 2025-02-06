import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRentalAgreement } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface RentalFormData {
  tenantName: string;
  tenantEmail: string;
  agreementFile: File | null;
}

const initialFormData: RentalFormData = {
  tenantName: "",
  tenantEmail: "",
  agreementFile: null,
};

export function RentalForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RentalFormData>(initialFormData);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tenantName.trim()) {
      newErrors.tenantName = "Tenant name is required";
    }

    if (!formData.tenantEmail.trim()) {
      newErrors.tenantEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.tenantEmail)) {
      newErrors.tenantEmail = "Invalid email format";
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
      setShowPreview(true);
    }
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const file = e.target.files?.[0] || null;
      setFormData((prev) => ({
        ...prev,
        agreementFile: file,
      }));

      // Clear file error when a new file is selected
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

  const handleCreateAgreement = async () => {
    const response = await createRentalAgreement(formData);
    if (response.success) {
      navigate("/signing", {
        state: {
          documentId: (response.data as { id: string }).id,
        },
      });
    }
  };

  if (showPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Preview Rental Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label>Tenant Name</Label>
                <div className="text-lg">{formData.tenantName}</div>
              </div>
              <div>
                <Label>Tenant Email</Label>
                <div className="text-lg">{formData.tenantEmail}</div>
              </div>
              <div>
                <Label>Agreement File</Label>
                <div className="text-lg">{formData.agreementFile?.name}</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleEdit} variant="outline" className="w-full">
                Edit Agreement
              </Button>
              <Button className="w-full" onClick={handleCreateAgreement}>
                Create Agreement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Rental Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenantName">Tenant Name</Label>
                <Input
                  id="tenantName"
                  name="tenantName"
                  placeholder="Enter tenant name"
                  value={formData.tenantName}
                  onChange={handleChange}
                  required
                />
                {errors.tenantName && (
                  <p className="text-sm text-red-500">{errors.tenantName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantEmail">Tenant Email</Label>
                <Input
                  id="tenantEmail"
                  name="tenantEmail"
                  type="email"
                  placeholder="Enter tenant email"
                  value={formData.tenantEmail}
                  onChange={handleChange}
                  required
                />
                {errors.tenantEmail && (
                  <p className="text-sm text-red-500">{errors.tenantEmail}</p>
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
              Preview Agreement
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
