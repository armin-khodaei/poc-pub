import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createContractorAgreement } from "@/lib/api";
import { useNavigate } from "react-router-dom";
// Dummy templates - to be replaced later
const contractTemplates = [
  {
    id: "70ab8ce4-9a87-46b0-af04-5d0872d2272f",
    name: "Standard Contractor Agreement",
  },
  {
    id: "0b0d6fdf-807f-48db-9c5a-a1b8a3513797",
    name: "IT Contractor Agreement",
  },
];

interface ContractorFormData {
  templateId: string;
  contractorName: string;
  contractorEmail: string;
}

const initialFormData: ContractorFormData = {
  templateId: "",
  contractorName: "",
  contractorEmail: "",
};

export function ContractorForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContractorFormData>(initialFormData);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.templateId) {
      setError("Please select a template");
      return;
    }
    const response = await createContractorAgreement(formData);
    if (response.success && response.data) {
      navigate("/signing", {
        state: {
          documentId: response.data.id,
          signerEmail: formData.contractorEmail,
          signerName: formData.contractorName,
        },
      });
    }
  };

  const handleTemplateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      templateId: value,
    }));
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Contractor Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select
                value={formData.templateId}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {contractTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="space-y-2">
              <Label>Contractor Name</Label>
              <Input
                type="text"
                value={formData.contractorName}
                onChange={(e) =>
                  setFormData({ ...formData, contractorName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contractor Email</Label>
              <Input
                type="email"
                value={formData.contractorEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contractorEmail: e.target.value })
                }
              />
            </div>

            <Button type="submit" className="w-full">
              Create Agreement
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
