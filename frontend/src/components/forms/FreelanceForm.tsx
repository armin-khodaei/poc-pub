import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFreelanceAgreement } from "@/lib/api";

interface FreelanceFormData {
  clientName: string;
  clientEmail: string;
  projectName: string;
  startDate: string;
  endDate: string;
  paymentAmount: string;
  contractType: string;
}

const initialFormData: FreelanceFormData = {
  clientName: "",
  clientEmail: "",
  projectName: "",
  startDate: "",
  endDate: "",
  paymentAmount: "",
  contractType: "freelance",
};

// NO Auto position for signature
export function FreelanceForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FreelanceFormData>(initialFormData);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = "Invalid email format";
    }

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (!formData.paymentAmount.trim()) {
      newErrors.paymentAmount = "Payment amount is required";
    } else if (
      isNaN(Number(formData.paymentAmount)) ||
      Number(formData.paymentAmount) <= 0
    ) {
      newErrors.paymentAmount = "Please enter a valid amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await createFreelanceAgreement(formData);

        if (response.success && response.data) {
          navigate("/signing", {
            state: {
              documentId: response.data.id,
              signerEmail: formData.clientEmail,
              signerName: formData.clientName,
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

  const handleEdit = () => {
    setShowPreview(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (showPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Preview Freelance Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label>Client Name</Label>
                <div className="text-lg">{formData.clientName}</div>
              </div>
              <div>
                <Label>Client Email</Label>
                <div className="text-lg">{formData.clientEmail}</div>
              </div>
              <div>
                <Label>Project Name</Label>
                <div className="text-lg">{formData.projectName}</div>
              </div>
              <div>
                <Label>Start Date</Label>
                <div className="text-lg">{formData.startDate}</div>
              </div>
              <div>
                <Label>End Date</Label>
                <div className="text-lg">{formData.endDate}</div>
              </div>
              <div>
                <Label>Payment Amount</Label>
                <div className="text-lg">${formData.paymentAmount}</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleEdit} variant="outline" className="w-full">
                Edit Agreement
              </Button>
              <Button onClick={handleSubmit} className="w-full">
                Create Agreement
              </Button>
            </div>
            {errors.submit && (
              <p className="text-sm text-red-500 text-center">
                {errors.submit}
              </p>
            )}
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
            <CardTitle>Create Freelance Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                />
                {errors.clientName && (
                  <p className="text-sm text-red-500">{errors.clientName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  placeholder="Enter client email"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  required
                />
                {errors.clientEmail && (
                  <p className="text-sm text-red-500">{errors.clientEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={handleChange}
                  required
                />
                {errors.projectName && (
                  <p className="text-sm text-red-500">{errors.projectName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500">{errors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
                <Input
                  id="paymentAmount"
                  name="paymentAmount"
                  type="number"
                  placeholder="Enter payment amount"
                  value={formData.paymentAmount}
                  onChange={handleChange}
                  required
                />
                {errors.paymentAmount && (
                  <p className="text-sm text-red-500">{errors.paymentAmount}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full">
              Preview Agreement
            </Button>
            {errors.submit && (
              <p className="text-sm text-red-500 text-center">
                {errors.submit}
              </p>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
