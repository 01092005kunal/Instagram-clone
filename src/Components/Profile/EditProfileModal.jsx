import {
  Avatar,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";

const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, userProfile, fetchProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "");
      setUsername(userProfile.username || "");
      setBio(userProfile.bio || "");
      setPreviewUrl(userProfile.profile_pic_url || null);
    }
  }, [userProfile, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Username cannot be empty",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      let avatarUrl = userProfile?.profile_pic_url || null;

      // 1. Upload new avatar if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("instagram-bucket")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("instagram-bucket")
          .getPublicUrl(filePath);

        avatarUrl = urlData.publicUrl;
      }

      // 2. Update user record in Supabase users table
      const formattedUsername = username.trim().toLowerCase();
      const updates = {
        full_name: fullName.trim(),
        username: formattedUsername,
        bio: bio.trim(),
        profile_pic_url: avatarUrl,
      };

      const { error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (updateError) throw updateError;

      // 3. Refresh user profile in AuthContext
      await fetchProfile(user.id);

      toast({
        title: "Profile updated",
        description: "Your profile was successfully saved!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onProfileUpdated?.();
      onClose();

      if (userProfile?.username !== formattedUsername) {
        navigate(`/${formattedUsername}`);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Update failed",
        description: err.message || "Failed to update profile",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent bg={"#121212"} border={"1px solid"} borderColor={"gray.800"} color={"white"}>
        <ModalHeader textAlign={"center"}>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            {/* Avatar Preview & Upload Button */}
            <Center flexDirection={"column"} gap={3}>
              <Avatar
                size={"2xl"}
                src={previewUrl || userProfile?.profile_pic_url || "/profilepic.png"}
                name={fullName || username}
                cursor={"pointer"}
                onClick={() => fileInputRef.current?.click()}
              />
              <Button
                size={"xs"}
                variant={"ghost"}
                color={"blue.400"}
                _hover={{ color: "blue.300" }}
                onClick={() => fileInputRef.current?.click()}
              >
                Change Profile Photo
              </Button>
              <Input
                type="file"
                ref={fileInputRef}
                display="none"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Center>

            <FormControl>
              <FormLabel fontSize={"sm"} color={"gray.400"}>
                Full Name
              </FormLabel>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                bg={"whiteAlpha.100"}
                borderColor={"gray.700"}
                _focus={{ borderColor: "blue.500" }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize={"sm"} color={"gray.400"}>
                Username
              </FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                bg={"whiteAlpha.100"}
                borderColor={"gray.700"}
                _focus={{ borderColor: "blue.500" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize={"sm"} color={"gray.400"}>
                Bio
              </FormLabel>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your story..."
                rows={3}
                bg={"whiteAlpha.100"}
                borderColor={"gray.700"}
                _focus={{ borderColor: "blue.500" }}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop={"1px solid"} borderColor={"gray.800"} gap={3}>
          <Button variant={"ghost"} onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button
            colorScheme={"blue"}
            onClick={handleSave}
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;
