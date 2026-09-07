import {
  Avatar,
  Box,
  Flex,
  IconButton,
  Spinner,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { FiEdit } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";
import NewChatModal from "./NewChatModal";

const ConversationList = ({ selectedConversation, onSelectConversation }) => {
  const { user, userProfile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: convs, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (!convs || convs.length === 0) {
        setConversations([]);
        return;
      }

      // Collect all user IDs involved
      const userIds = [
        ...new Set(convs.flatMap((c) => [c.user1_id, c.user2_id])),
      ];

      const { data: usersData } = await supabase
        .from("users")
        .select("*")
        .in("id", userIds);

      const usersMap = (usersData || []).reduce((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});

      const populated = convs.map((c) => ({
        ...c,
        user1: usersMap[c.user1_id] || { username: "user" },
        user2: usersMap[c.user2_id] || { username: "user" },
      }));

      setConversations(populated);
    } catch (err) {
      console.error("Error fetching conversations:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();

    // Listen for realtime conversation updates
    const channel = supabase
      .channel("conversations-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  const handleSelectNewConv = (conv) => {
    fetchConversations();
    onSelectConversation(conv);
  };

  return (
    <Box
      w={{ base: selectedConversation ? "0px" : "full", md: "350px" }}
      display={{ base: selectedConversation ? "none" : "block", md: "block" }}
      borderRight={"1px solid"}
      borderColor={"gray.800"}
      height={"100vh"}
      overflowY={"auto"}
    >
      {/* Header */}
      <Flex
        px={6}
        py={5}
        justify={"space-between"}
        align={"center"}
        borderBottom={"1px solid"}
        borderColor={"gray.800"}
      >
        <Text fontSize={"lg"} fontWeight={"bold"}>
          {userProfile?.username || "Messages"}
        </Text>
        <IconButton
          icon={<FiEdit size={20} />}
          variant={"ghost"}
          size={"sm"}
          aria-label="New message"
          onClick={onOpen}
          _hover={{ bg: "whiteAlpha.200" }}
        />
      </Flex>

      {/* Conversations */}
      {isLoading ? (
        <Flex justify={"center"} py={12}>
          <Spinner size={"md"} color={"blue.500"} />
        </Flex>
      ) : conversations.length === 0 ? (
        <Flex direction={"column"} align={"center"} justify={"center"} py={16} px={4} gap={3}>
          <Text fontSize={"sm"} color={"gray.400"} textAlign={"center"}>
            No conversations yet.
          </Text>
          <Text
            fontSize={"xs"}
            color={"blue.400"}
            cursor={"pointer"}
            fontWeight={"bold"}
            onClick={onOpen}
          >
            Send a message to start chatting!
          </Text>
        </Flex>
      ) : (
        <VStack align={"stretch"} spacing={0}>
          {conversations.map((conv) => {
            const otherUser = conv.user1_id === user.id ? conv.user2 : conv.user1;
            const isSelected = selectedConversation?.id === conv.id;

            return (
              <Flex
                key={conv.id}
                p={4}
                align={"center"}
                gap={3}
                cursor={"pointer"}
                bg={isSelected ? "whiteAlpha.200" : "transparent"}
                _hover={{ bg: "whiteAlpha.100" }}
                onClick={() => onSelectConversation(conv)}
                transition={"0.2s ease"}
              >
                <Avatar
                  src={otherUser?.profile_pic_url || "/profilepic.png"}
                  name={otherUser?.full_name || otherUser?.username}
                  size={"md"}
                />
                <Box flex={1} overflow={"hidden"}>
                  <Text fontSize={"sm"} fontWeight={"bold"} isTruncated>
                    {otherUser?.username || "user"}
                  </Text>
                  <Text fontSize={"xs"} color={"gray.400"} isTruncated>
                    {conv.last_message || "Started a chat"}
                  </Text>
                </Box>
              </Flex>
            );
          })}
        </VStack>
      )}

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isOpen}
        onClose={onClose}
        onSelectConversation={handleSelectNewConv}
      />
    </Box>
  );
};

export default ConversationList;
