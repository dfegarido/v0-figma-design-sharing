"use client";

import { useState } from "react";
import { ScreenHeader } from "./screen-header";
import { PageFooter } from "./page-footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Camera, Upload, X, Home, Building2, Landmark, LayoutGrid, LandPlot } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { BuyerCriteria } from "./buyer-criteria-screen";
import { defaultBuyerCriteria } from "./buyer-criteria-screen";

interface OnboardingFlowProps {
  onBack: () => void;
  onComplete: (criteria?: BuyerCriteria) => void;
}

const STEPS = [
  { title: "Step 1", subtitle: "We need to know how to contact you" },
  { title: "Step 2", subtitle: "We need to know how to contact you" },
  { title: "Step 3", subtitle: "We just need some basic details about your house" },
  { title: "Step 4", subtitle: "Show us what you got!" },
  { title: "Step 5", subtitle: "What do you want?" },
  { title: "Step 6", subtitle: "What type of property are you after?" },
  { title: "Step 7", subtitle: "How much land do you need?" },
  { title: "Step 8", subtitle: "Pick features that matter to you" },
];

const propertyTypeCards = [
  { type: "House" as const, icon: Home, label: "House" },
  { type: "Apartment" as const, icon: Building2, label: "Apartment" },
  { type: "Townhouse" as const, icon: Landmark, label: "Townhouse" },
  { type: "Unit" as const, icon: LayoutGrid, label: "Unit" },
  { type: "Land" as const, icon: LandPlot, label: "Land" },
];

const featureChips = [
  "Pool", "Garden", "Ocean View", "City View", "Mountain View",
  "Granny Flat", "Garage", "Solar Panels", "Renovated", "Heritage",
  "Smart Home", "Fireplace", "Pet Friendly", "Quiet Street",
];

export function OnboardingFlow({ onBack, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    ownsHome: true,
    bedrooms: "",
    bathrooms: "",
    carBays: "",
    sqm2: "",
    mainImage: null as string | null,
    additionalImages: [] as string[],
    preferredRegion: "",
    minBedrooms: "",
    minBathrooms: "",
    minCarBays: "",
    minSqm2: "",
    priceRange: [500000, 1200000],
    preferredPropertyTypes: [] as string[],
    preferredLandSize: [0, 2000],
    preferredFeatures: [] as string[],
  });

  const handleNext = () => {
    if (step < 8) {
      setStep(step + 1);
    } else {
      const criteria: BuyerCriteria = {
        ...defaultBuyerCriteria,
        suburbs: formData.preferredRegion ? [formData.preferredRegion] : [],
        minPrice: formData.priceRange[0],
        maxPrice: formData.priceRange[1],
        minBeds: formData.minBedrooms ? parseInt(formData.minBedrooms) : 0,
        minBaths: formData.minBathrooms ? parseInt(formData.minBathrooms) : 0,
        minParking: formData.minCarBays ? parseInt(formData.minCarBays) : 0,
        minLandSize: formData.preferredLandSize[0],
        maxLandSize: formData.preferredLandSize[1],
        propertyTypes: formData.preferredPropertyTypes as BuyerCriteria["propertyTypes"],
        features: formData.preferredFeatures,
      };
      onComplete(criteria);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleSkip = () => {
    if (step < 8) {
      setStep(step + 1);
    }
  };

  const togglePropertyType = (type: string) => {
    const types = formData.preferredPropertyTypes.includes(type)
      ? formData.preferredPropertyTypes.filter((t) => t !== type)
      : [...formData.preferredPropertyTypes, type];
    setFormData({ ...formData, preferredPropertyTypes: types });
  };

  const toggleFeature = (feature: string) => {
    const features = formData.preferredFeatures.includes(feature)
      ? formData.preferredFeatures.filter((f) => f !== feature)
      : [...formData.preferredFeatures, feature];
    setFormData({ ...formData, preferredFeatures: features });
  };

  const handleImageUpload = (isMain: boolean) => {
    // Simulate image upload with placeholder
    const placeholderImages = [
      "/houses/house-1.jpg",
      "/houses/house-2.jpg",
      "/houses/house-3.jpg",
      "/houses/house-4.jpg",
    ];
    
    if (isMain) {
      setFormData({ ...formData, mainImage: placeholderImages[0] });
    } else {
      const newImages = [...formData.additionalImages];
      if (newImages.length < 3) {
        newImages.push(placeholderImages[newImages.length + 1]);
        setFormData({ ...formData, additionalImages: newImages });
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.additionalImages.filter((_, i) => i !== index);
    setFormData({ ...formData, additionalImages: newImages });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="bg-background border-foreground/30 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="bg-background border-foreground/30 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="bg-background border-foreground/30 h-12"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">Your Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-background border-foreground/30 h-12"
                placeholder="Start typing your address..."
              />
            </div>

            <RadioGroup defaultValue="1" className="space-y-3">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center space-x-3">
                  <RadioGroupItem value={String(num)} id={`address-${num}`} />
                  <Label htmlFor={`address-${num}`} className="text-sm">
                    {num} My Address Here, My State, 1234
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ownsHome"
                checked={formData.ownsHome}
                onCheckedChange={(checked) => setFormData({ ...formData, ownsHome: checked as boolean })}
              />
              <Label htmlFor="ownsHome">I own a home</Label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Bedrooms</Label>
              <Select
                value={formData.bedrooms}
                onValueChange={(value) => setFormData({ ...formData, bedrooms: value })}
              >
                <SelectTrigger className="h-12 bg-background border-foreground/30">
                  <SelectValue placeholder="Select bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bathrooms</Label>
              <Select
                value={formData.bathrooms}
                onValueChange={(value) => setFormData({ ...formData, bathrooms: value })}
              >
                <SelectTrigger className="h-12 bg-background border-foreground/30">
                  <SelectValue placeholder="Select bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Car bays</Label>
              <Select
                value={formData.carBays}
                onValueChange={(value) => setFormData({ ...formData, carBays: value })}
              >
                <SelectTrigger className="h-12 bg-background border-foreground/30">
                  <SelectValue placeholder="Select car bays" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sqm">Sqm2</Label>
              <Input
                id="sqm"
                type="number"
                value={formData.sqm2}
                onChange={(e) => setFormData({ ...formData, sqm2: e.target.value })}
                className="bg-background border-foreground/30 h-12"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-primary text-center block">Main Image</Label>
              {formData.mainImage ? (
                <div className="relative w-32 h-32 mx-auto border border-foreground/30 rounded-lg overflow-hidden">
                  <Image
                    src={formData.mainImage || "/placeholder.svg"}
                    alt="Main house image"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setFormData({ ...formData, mainImage: null })}
                    className="absolute top-1 right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto border-2 border-dashed border-foreground/30 rounded-lg flex items-center justify-center">
                  <X className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex justify-center gap-8">
                <button 
                  onClick={() => handleImageUpload(true)}
                  className="flex flex-col items-center gap-1 text-sm"
                >
                  <Camera className="w-6 h-6" />
                  Take Photo
                </button>
                <button 
                  onClick={() => handleImageUpload(true)}
                  className="flex flex-col items-center gap-1 text-sm"
                >
                  <Upload className="w-6 h-6" />
                  Upload
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-primary text-center block">Additional Images</Label>
              <div className="flex justify-center gap-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="relative">
                    {formData.additionalImages[index] ? (
                      <div className="relative w-20 h-20 border border-foreground/30 rounded-lg overflow-hidden">
                        <Image
                          src={formData.additionalImages[index] || "/placeholder.svg"}
                          alt={`Additional image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-primary-foreground" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 border-2 border-dashed border-foreground/30 rounded-lg flex items-center justify-center">
                        <X className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-8">
                <button 
                  onClick={() => handleImageUpload(false)}
                  className="flex flex-col items-center gap-1 text-sm"
                >
                  <Camera className="w-6 h-6" />
                  Take Photo
                </button>
                <button 
                  onClick={() => handleImageUpload(false)}
                  className="flex flex-col items-center gap-1 text-sm"
                >
                  <Upload className="w-6 h-6" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="region">Region or suburb</Label>
              <Input
                id="region"
                value={formData.preferredRegion}
                onChange={(e) => setFormData({ ...formData, preferredRegion: e.target.value })}
                className="bg-background border-foreground/30 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Minimum Bedrooms</Label>
              <Select
                value={formData.minBedrooms}
                onValueChange={(value) => setFormData({ ...formData, minBedrooms: value })}
              >
                <SelectTrigger className="h-12 bg-background border-foreground/30">
                  <SelectValue placeholder="Select minimum" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Minimum Bathrooms</Label>
              <Select
                value={formData.minBathrooms}
                onValueChange={(value) => setFormData({ ...formData, minBathrooms: value })}
              >
                <SelectTrigger className="h-12 bg-background border-foreground/30">
                  <SelectValue placeholder="Select minimum" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Minimum car bays</Label>
              <Select
                value={formData.minCarBays}
                onValueChange={(value) => setFormData({ ...formData, minCarBays: value })}
              >
                <SelectTrigger className="h-12 bg-background border-foreground/30">
                  <SelectValue placeholder="Select minimum" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minSqm">Minimum Sqm2</Label>
              <Input
                id="minSqm"
                type="number"
                value={formData.minSqm2}
                onChange={(e) => setFormData({ ...formData, minSqm2: e.target.value })}
                className="bg-background border-foreground/30 h-12"
              />
            </div>

            <div className="space-y-4">
              <Label>Cost</Label>
              <Slider
                value={formData.priceRange}
                onValueChange={(value) => setFormData({ ...formData, priceRange: value })}
                min={100000}
                max={5000000}
                step={50000}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${(formData.priceRange[0] / 1000).toFixed(0)}k</span>
                <span>${(formData.priceRange[1] / 1000000).toFixed(1)}m</span>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm text-center">Select all that interest you</p>
            <div className="grid grid-cols-2 gap-3">
              {propertyTypeCards.map(({ type, icon: Icon, label }) => {
                const selected = formData.preferredPropertyTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => togglePropertyType(type)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${selected ? "text-primary" : "text-foreground"}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8">
            <p className="text-muted-foreground text-sm text-center">Drag to set your preferred land size range</p>
            <div className="space-y-6 px-2">
              <Slider
                value={formData.preferredLandSize}
                onValueChange={(value) => setFormData({ ...formData, preferredLandSize: value })}
                min={0}
                max={2000}
                step={50}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formData.preferredLandSize[0]}m²</span>
                <span>{formData.preferredLandSize[1]}m²</span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setFormData({ ...formData, preferredLandSize: [0, 2000] })}
                className="text-sm text-primary underline"
              >
                {"I don't mind"}
              </button>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm text-center">Pick all the features that matter to you</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {featureChips.map((feature) => (
                <Badge
                  key={feature}
                  variant={formData.preferredFeatures.includes(feature) ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                    formData.preferredFeatures.includes(feature)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => toggleFeature(feature)}
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScreenHeader onBack={handleBack} />

      <div className="flex-1 flex flex-col px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">{STEPS[step - 1].title}</h2>
          <p className="text-muted-foreground text-sm">{STEPS[step - 1].subtitle}</p>
        </div>

        {renderStep()}

        <div className="flex justify-center gap-4 mt-8 pb-4">
          <button
            onClick={handleBack}
            className="px-6 py-2 border-2 border-foreground rounded-lg hover:bg-foreground/5 transition-colors"
          >
            Back
          </button>
          {step === 4 && (
            <button
              onClick={handleSkip}
              className="px-6 py-2 border-2 border-foreground rounded-lg hover:bg-foreground/5 transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-2 border-2 border-foreground rounded-lg hover:bg-foreground/5 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
