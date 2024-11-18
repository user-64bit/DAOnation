"use client";

import UpdateUserProfileAction from "@/actions/updateUserProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "./spinner";
import { useEdgeStore } from "@/lib/edgestore";

export default function UserProfile({
  coverImageValue,
  profileImageValue,
  usernameValue,
  displayNameValue,
  descriptionValue,
  instagramValue,
  linkedinValue,
  twitterValue,
  githubValue,
  solanaPublicKeyValue,
  email,
}: {
  coverImageValue: string;
  profileImageValue: string;
  usernameValue: string;
  displayNameValue: string;
  descriptionValue: string;
  instagramValue: string;
  linkedinValue: string;
  twitterValue: string;
  githubValue: string;
  solanaPublicKeyValue: string;
  email: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { edgestore } = useEdgeStore();
  const [coverImage, setCoverImage] = useState(
    coverImageValue ||
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JhZGllbnR8ZW58MHx8MHx8fDA%3D"
  );
  const [profileImage, setProfileImage] = useState(
    profileImageValue ||
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D"
  );
  const [formErrors, setFormErrors] = useState<any>({
    username: "",
    displayName: "",
    description: "",
    twitter: "",
    instagram: "",
    github: "",
    linkedin: "",
    blockchainKeys: {},
  });
  const [blockchainKeys, setBlockchainKeys] = useState<any>({
    solana: solanaPublicKeyValue || "",
  });
  const [currentBlockchain, setCurrentBlockchain] = useState("solana");

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: (value: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      const response = await edgestore.publicFiles.upload({
        file,
      });
      setImage(response.url);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newErrors = { ...formErrors };
    let hasError = false;

    Object.keys(formErrors).forEach((key) => {
      if (key === "blockchainKeys") {
        const keyErrors: any = {};
        Object.entries(blockchainKeys).forEach(([blockchain, key]) => {
          keyErrors[blockchain] = key ? "" : "This field is required*";
          if (keyErrors[blockchain]) {
            hasError = true;
          }
        });
        newErrors.blockchainKeys = keyErrors;
      } else if (!formData.get(key)) {
        newErrors[key] = "This field is required*";
        hasError = true;
      } else {
        newErrors[key] = "";
      }
    });

    setFormErrors(newErrors);

    if (!hasError) {
      setIsLoading(true);
      try {
        const username = formData.get("username") as string;
        const display_name = formData.get("displayName") as string;
        const description = formData.get("description") as string;
        const x_url = formData.get("twitter") as string;
        const instagram_url = formData.get("instagram") as string;
        const github_url = formData.get("github") as string;
        const linkedin_url = formData.get("linkedin") as string;

        const { data, error, statusCode } = await UpdateUserProfileAction({
          username,
          profile_image: profileImage,
          cover_image: coverImage,
          email,
          display_name,
          description,
          x_url,
          instagram_url,
          github_url,
          linkedin_url,
          blockchainKeys,
        });
        if (statusCode === 200) {
          router.push("/dashboard");
        } else {
          console.log(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBlockchainKeyChange = (blockchain: string, value: string) => {
    setBlockchainKeys((prev: any) => ({
      ...prev,
      [blockchain]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between">
          <h1
            className="text-3xl font-bold mb-8 text-center cursor-pointer hover:bg-zinc-700 rounded-full p-2"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft />
          </h1>{" "}
          <h1 className="text-3xl font-bold mb-8 text-center">
            Edit Your Profile
          </h1>{" "}
          <h1 className="invisible text-3xl font-bold mb-8 text-center">
            Hidden
          </h1>
        </div>

        <Card className="bg-zinc-800 border-none mb-8 pb-12 pt-3">
          <CardContent className="space-y-4 pt-4 pb-6">
            <div className="relative">
              <motion.div
                className="relative h-48 rounded-lg overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={coverImage as string}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <Label
                  htmlFor="cover-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-white" />
                </Label>
                <Input
                  id="cover-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setCoverImage)}
                  accept="image/*"
                />
              </motion.div>
              <motion.div
                className="absolute left-3 bottom-0 transform translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900">
                  <img
                    src={profileImage as string}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <Label
                    htmlFor="profile-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </Label>
                  <Input
                    id="profile-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setProfileImage)}
                    accept="image/*"
                  />
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-none text-white">
          <CardContent className="pt-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center">
                  <div className="text-zinc-400 px-3 py-1.5 rounded-l-md border border-zinc-400/30">
                    daonation.xyz/
                  </div>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={usernameValue}
                    placeholder="Your unique identity"
                    className="bg-zinc-700 border-zinc-600 text-zinc-100 rounded-l-none"
                  />
                </div>
                {formErrors?.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.username}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={displayNameValue}
                  placeholder="A cool Display Name"
                  className="bg-zinc-700 border-zinc-600 text-zinc-100"
                />
                {formErrors.displayName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.displayName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={descriptionValue}
                  placeholder={"A Cool Description about you"}
                  className="bg-zinc-700 border-zinc-600 text-zinc-100"
                  rows={4}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  Social Media Links <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Twitter className="w-5 h-5 text-zinc-400" />
                    <Input
                      placeholder="url or # if not"
                      name="twitter"
                      defaultValue={twitterValue}
                      className="bg-zinc-700 border-zinc-600 text-zinc-100"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Instagram className="w-5 h-5 text-zinc-400" />
                    <Input
                      placeholder="url or # if not"
                      name="instagram"
                      defaultValue={instagramValue}
                      className="bg-zinc-700 border-zinc-600 text-zinc-100"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Github className="w-5 h-5 text-zinc-400" />
                    <Input
                      placeholder="url or # if not"
                      name="github"
                      defaultValue={githubValue}
                      className="bg-zinc-700 border-zinc-600 text-zinc-100"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-5 h-5 text-zinc-400" />
                    <Input
                      placeholder="url or # if not"
                      name="linkedin"
                      defaultValue={linkedinValue}
                      className="bg-zinc-700 border-zinc-600 text-zinc-100"
                    />
                  </div>
                </div>
                {(formErrors.twitter ||
                  formErrors.instagram ||
                  formErrors.github ||
                  formErrors.linkedin) && (
                  <p className="text-red-500 text-sm mt-1">
                    All social media links are required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  Public Keys <span className="text-red-500">*</span>
                </Label>
                <div className="flex justify-center space-x-4 mb-2">
                  <Button
                    type="button"
                    onClick={() => setCurrentBlockchain("solana")}
                    className={`text-sm ${
                      currentBlockchain === "solana"
                        ? "bg-blue-600"
                        : "bg-zinc-700"
                    }`}
                  >
                    Solana
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder={`Enter ${currentBlockchain} public key`}
                    value={
                      blockchainKeys[currentBlockchain] || solanaPublicKeyValue
                    }
                    onChange={(e) =>
                      handleBlockchainKeyChange(
                        currentBlockchain,
                        e.target.value
                      )
                    }
                    className="bg-zinc-700 border-zinc-600 text-zinc-100"
                  />
                </div>
                {formErrors.blockchainKeys &&
                  formErrors.blockchainKeys[currentBlockchain] && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.blockchainKeys[currentBlockchain]}
                    </p>
                  )}
              </div>
              <Button
                type="submit"
                className="w-full text-white"
                disabled={isLoading}
              >
                {isLoading ? <Spinner size={"sm"} /> : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}