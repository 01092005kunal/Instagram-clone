import {
  Button,
  CloseButton,
  Flex,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { BsCardImage } from "react-icons/bs";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const imageRef = useRef(null);
  const { user } = useAuth();
  const toast = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
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

  const handleClose = () => {
    setCaption("");
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const handlePostCreation = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please choose an image for your post",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `posts/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("instagram-bucket")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Get public URL of the uploaded image
      const { data: urlData } = supabase.storage
        .from("instagram-bucket")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Insert post row into posts table
      const { data: newPost, error: insertError } = await supabase
        .from("posts")
        .insert([
          {
            user_id: user.id,
            caption: caption.trim(),
            image_url: publicUrl,
          },
        ])
        .select("*, users(*), likes(*), comments(*)")
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Post created successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      handleClose();
      // Reload page or trigger feed refresh
      window.dispatchEvent(new Event("post-created"));
    } catch (err) {
      toast({
        title: "Failed to create post",
        description: err.message || "An error occurred",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={"#121212"} border={"1px solid"} borderColor={"gray.700"}>
        <ModalHeader borderBottom={"1px solid"} borderColor={"gray.800"} textAlign={"center"}>
          Create New Post
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            mb={4}
            resize={"none"}
            rows={3}
            bg={"gray.900"}
            borderColor={"gray.700"}
          />

          <Input
            type="file"
            hidden
            ref={imageRef}
            onChange={handleImageChange}
            accept="image/*"
          />

          {!previewUrl ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="240px"
              border="2px dashed"
              borderColor="gray.700"
              borderRadius="md"
              cursor="pointer"
              _hover={{ borderColor: "blue.400" }}
              onClick={() => imageRef.current.click()}
            >
              <BsCardImage size={48} />
              <Button mt={4} size="sm" colorScheme="blue">
                Select from computer
              </Button>
            </Flex>
          ) : (
            <Flex position="relative" justify="center" align="center">
              <Image
                src={previewUrl}
                alt="Selected img"
                maxH="350px"
                borderRadius="md"
                objectFit="contain"
              />
              <CloseButton
                position="absolute"
                top={2}
                right={2}
                bg="blackAlpha.700"
                _hover={{ bg: "blackAlpha.900" }}
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              />
            </Flex>
          )}
        </ModalBody>

        <ModalFooter borderTop={"1px solid"} borderColor={"gray.800"}>
          <Button mr={3} variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handlePostCreation}
            isLoading={isLoading}
            disabled={!selectedFile}
          >
            Post
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreatePostModal;
