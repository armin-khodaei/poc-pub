import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/lib/countries";
import {
  formatPhoneNumber,
  unformatPhoneNumber,
  validatePhoneNumber,
} from "@/lib/utils";
import { createEmployeeAgreement } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

type SendingMethod = "email" | "sms" | "whatsapp";
type VerificationMethod =
  | "absher"
  | "nafath"
  | "nafath_app"
  | "nafath_app_with_biometrics";

interface EmployeeFormData {
  fullName: string;
  sendingMethod: SendingMethod;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  needsVerification?: boolean;
  verificationType?: VerificationMethod;
  nationalId?: string;
}

const initialFormData: EmployeeFormData = {
  fullName: "",
  sendingMethod: "email",
  email: "",
  phoneNumber: "",
  countryCode: countries[0].dial_code,
  needsVerification: false,
  verificationType: undefined,
  nationalId: "",
};

export function EmployeeForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (formData.sendingMethod === "email") {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    } else {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (formData.countryCode) {
        const phoneError = validatePhoneNumber(
          formData.phoneNumber,
          formData.countryCode
        );
        if (phoneError) {
          newErrors.phoneNumber = phoneError;
        }
      }
    }

    if (formData.needsVerification) {
      if (!formData.verificationType) {
        newErrors.verificationType = "Verification type is required";
      }
      if (
        formData.verificationType &&
        formData.verificationType !== "nafath" &&
        !formData.nationalId
      ) {
        newErrors.nationalId =
          "National ID is required for this verification method";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      // Format the phone number as user types
      const unformattedValue = unformatPhoneNumber(value);
      const formattedValue = formatPhoneNumber(unformattedValue);

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));

      // Clear error when user starts typing
      if (errors.phoneNumber) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMethodChange = (value: SendingMethod) => {
    setFormData((prev) => ({
      ...prev,
      sendingMethod: value,
      email: value === "email" ? "" : undefined,
      phoneNumber: value !== "email" ? "" : undefined,
      countryCode: value !== "email" ? countries[0].dial_code : undefined,
    }));
    setErrors({});
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: value,
      // Clear phone number when country changes to avoid validation issues
      phoneNumber: "",
    }));
    setErrors((prev) => ({
      ...prev,
      phoneNumber: "",
    }));
  };

  const getFullPhoneNumber = () => {
    if (!formData.phoneNumber || !formData.countryCode) return "";
    const unformattedNumber = unformatPhoneNumber(formData.phoneNumber);
    return `${formData.countryCode} ${formatPhoneNumber(unformattedNumber)}`;
  };

  const getSelectedCountry = () => {
    return countries.find(
      (country) => country.dial_code === formData.countryCode
    );
  };

  const handleCreateAgreement = async () => {
    const response = await createEmployeeAgreement({
      ...formData,
      phoneNumber: getFullPhoneNumber().replace(/\s/g, ""),
    });
    if (response.success) {
      toast({
        title: "Agreement created successfully",
        description: "Your action was completed successfully.",
      });
      navigate("/requests");
    }
  };

  if (showPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Preview Employee Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label>Full Name</Label>
                <div className="text-lg">{formData.fullName}</div>
              </div>
              <div>
                <Label>Sending Method</Label>
                <div className="text-lg capitalize">
                  {formData.sendingMethod}
                </div>
              </div>
              {formData.sendingMethod === "email" && (
                <div>
                  <Label>Email</Label>
                  <div className="text-lg">{formData.email}</div>
                </div>
              )}
              {formData.sendingMethod !== "email" && (
                <div>
                  <Label>Phone Number</Label>
                  <div className="text-lg">{getFullPhoneNumber()}</div>
                </div>
              )}
              {formData.needsVerification && (
                <>
                  <div>
                    <Label>Verification Required</Label>
                    <div className="text-lg text-green-600">Yes</div>
                  </div>
                  <div>
                    <Label>Verification Method</Label>
                    <div className="text-lg capitalize">
                      {formData.verificationType?.replace(/_/g, " ")}
                    </div>
                  </div>
                  {formData.verificationType &&
                    formData.verificationType !== "nafath" && (
                      <div>
                        <Label>National ID</Label>
                        <div className="text-lg">{formData.nationalId}</div>
                      </div>
                    )}
                </>
              )}
            </div>
            <div className="flex gap-4">
              <Button onClick={handleEdit} variant="outline" className="w-full">
                Edit Details
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

  const selectedCountry = getSelectedCountry();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Employee Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Sending Method</Label>
                <Select
                  value={formData.sendingMethod}
                  onValueChange={handleMethodChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sending method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.sendingMethod === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email || ""}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.countryCode}
                      onValueChange={handleCountryChange}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          {selectedCountry && (
                            <span className="flex items-center gap-2">
                              <span>{selectedCountry.flag}</span>
                              <span>{selectedCountry.dial_code}</span>
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem
                            key={country.code}
                            value={country.dial_code}
                          >
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.dial_code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder={
                        selectedCountry
                          ? `${selectedCountry.dial_code} phone number`
                          : "Enter phone number"
                      }
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      required
                      className="flex-1"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsVerification"
                  checked={formData.needsVerification}
                  onCheckedChange={(checked: boolean) => {
                    setFormData((prev) => ({
                      ...prev,
                      needsVerification: checked,
                      verificationType: undefined,
                      nationalId: "",
                    }));
                  }}
                />
                <Label htmlFor="needsVerification">Requires Verification</Label>
              </div>

              {formData.needsVerification && (
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Verification Method</Label>
                    <Select
                      value={formData.verificationType}
                      onValueChange={(value: VerificationMethod) => {
                        setFormData((prev) => ({
                          ...prev,
                          verificationType: value,
                          nationalId: value === "nafath" ? "" : prev.nationalId,
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="absher">Absher</SelectItem>
                        <SelectItem value="nafath">Nafath</SelectItem>
                        <SelectItem value="nafath_app">Nafath App</SelectItem>
                        <SelectItem value="nafath_app_with_biometrics">
                          Nafath App with Biometrics
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.verificationType && (
                      <p className="text-sm text-red-500">
                        {errors.verificationType}
                      </p>
                    )}
                  </div>

                  {formData.verificationType &&
                    formData.verificationType !== "nafath" && (
                      <div className="space-y-2">
                        <Label htmlFor="nationalId">National ID</Label>
                        <Input
                          id="nationalId"
                          name="nationalId"
                          value={formData.nationalId}
                          onChange={handleChange}
                          placeholder="Enter National ID"
                        />
                        {errors.nationalId && (
                          <p className="text-sm text-red-500">
                            {errors.nationalId}
                          </p>
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full">
              Preview Details
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
