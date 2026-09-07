import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";

const NewChatModal = ({ isOpen, onClose, onSelectConversation }) => {
  const { user, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  // Load existing registered users when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const loadInitialUsers = async () => {
        setIsSearching(true);
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .neq("id", user.id)
            .limit(10);
          if (!error && data) {
            setSearchResults(data);
          }
        } catch (err) {
          console.error("Error loading users:", err);
        } finally {
          setIsSearching(false);
        }
      };
      loadInitialUsers();
    } else {
      setSearchQuery("");
    }
  }, [isOpen, user]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setIsSearching(true);
      try {
        const { data } = await supabase
          .from("users")
          .select("*")
          .neq("id", user?.id)
          .limit(10);
        setSearchResults(data || []);
      } finally {
        setIsSearching(false);
      }
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike("username", `%${query.trim()}%`)
        .neq("id", user?.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error("Search error:", err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (targetUser) => {
    if (!user || !targetUser) return;
    setIsCreating(true);

    try {
      // 1. Check if conversation already exists
      const { data: existingList, error: findError } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${targetUser.id}),and(user1_id.eq.${targetUser.id},user2_id.eq.${user.id})`
        );

      if (findError) {
        toast({
          title: "Supabase Setup Required",
          description: "Please run the conversations SQL table script in your Supabase dashboard!",
          status: "error",
          duration: 6000,
          isClosable: true,
        });
        throw findError;
      }

      if (existingList && existingList.length > 0) {
        const existingConv = existingList[0];
        const convWithUsers = {
          ...existingConv,
          user1: existingConv.user1_id === user.id ? userProfile : targetUser,
          user2: existingConv.user2_id === user.id ? userProfile : targetUser,
        };
        onSelectConversation(convWithUsers);
        onClose();
        return;
      }

      // 2. Otherwise create a new conversation
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert([
          {
            user1_id: user.id,
            user2_id: targetUser.id,
            last_message: "",
          },
        ])
        .select("*")
        .single();

      if (createError) {
        toast({
          title: "Could not start chat",
          description: createError.message,
          status: "error",
          duration: 6000,
          isClosable: true,
        });
        throw createError;
      }

      const convWithUsers = {
        ...newConv,
        user1: userProfile,
        user2: targetUser,
      };

      onSelectConversation(convWithUsers);
      onClose();
    } catch (err) {
      console.error("Error starting chat:", err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent bg={"#121212"} border={"1px solid"} borderColor={"gray.700"}>
        <ModalHeader borderBottom={"1px solid"} borderColor={"gray.800"} textAlign={"center"}>
          New Message
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex align={"center"} borderBottom={"1px solid"} borderColor={"gray.800"} py={2} mb={4}>
            <Text fontWeight={"bold"} mr={4} fontSize={"sm"}>
              To:
            </Text>
            <Input
              variant={"unstyled"}
              placeholder="Search by username..."
              fontSize={"sm"}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </Flex>

          {isSearching && (
            <Flex justify={"center"} py={6}>
              <Spinner size={"sm"} color={"blue.500"} />
            </Flex>
          )}

          {!isSearching && searchResults.length > 0 && (
            <VStack align={"stretch"} spacing={3} maxH={"260px"} overflowY={"auto"}>
              {searchResults.map((targetUser) => (
                <Flex
                  key={targetUser.id}
                  align={"center"}
                  justify={"space-between"}
                  p={2}
                  borderRadius={"md"}
                  _hover={{ bg: "whiteAlpha.100" }}
                  cursor={"pointer"}
                  onClick={() => handleStartChat(targetUser)}
                >
                  <Flex align={"center"} gap={3}>
                    <Avatar
                      src={targetUser.profile_pic_url || "/profilepic.png"}
                      name={targetUser.full_name || targetUser.username}
                      size={"sm"}
                    />
                    <Box>
                      <Text fontSize={"sm"} fontWeight={"bold"}>
                        {targetUser.username}
                      </Text>
                      {targetUser.full_name && (
                        <Text fontSize={"xs"} color={"gray.400"}>
                          {targetUser.full_name}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                  <Button size={"xs"} colorScheme={"blue"} isLoading={isCreating}>
                    Chat
                  </Button>
                </Flex>
              ))}
            </VStack>
          )}

          {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
            <Text textAlign={"center"} color={"gray.500"} fontSize={"sm"} py={4}>
              No account found with username "{searchQuery}"
            </Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NewChatModal;
