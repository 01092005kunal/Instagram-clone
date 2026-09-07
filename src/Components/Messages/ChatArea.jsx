import {
  Avatar,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";
import { MessagesLogo } from "../../assets/constants";

const ChatArea = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const otherUser =
    conversation && (conversation.user1_id === user?.id ? conversation.user2 : conversation.user1);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    if (!conversation?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Error loading messages:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversation?.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time listener for incoming messages
  useEffect(() => {
    if (!conversation?.id) return;

    const channel = supabase
      .channel(`chat-room-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !user || !conversation?.id || isSending) return;

    setIsSending(true);
    setInputText("");

    try {
      // 1. Insert message
      const { error: msgError } = await supabase.from("messages").insert([
        {
          conversation_id: conversation.id,
          sender_id: user.id,
          text: trimmed,
        },
      ]);

      if (msgError) throw msgError;

      // 2. Update conversation last_message and updated_at
      await supabase
        .from("conversations")
        .update({
          last_message: trimmed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversation.id);
    } catch (err) {
      console.error("Send message error:", err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Empty state if no conversation selected
  if (!conversation) {
    return (
      <Flex
        flex={1}
        direction={"column"}
        align={"center"}
        justify={"center"}
        height={"100vh"}
        p={8}
        textAlign={"center"}
        display={{ base: "none", md: "flex" }}
      >
        <Flex
          border={"2px solid"}
          borderColor={"white"}
          borderRadius={"full"}
          p={5}
          mb={4}
          justify={"center"}
          align={"center"}
        >
          <MessagesLogo />
        </Flex>
        <Text fontSize={"xl"} fontWeight={"bold"} mb={2}>
          Your Messages
        </Text>
        <Text color={"gray.400"} fontSize={"sm"} maxW={"300px"} mb={4}>
          Send private photos and messages to a friend or group.
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      flex={1}
      direction={"column"}
      height={"100vh"}
      display={{ base: conversation ? "flex" : "none", md: "flex" }}
    >
      {/* Header */}
      <Flex
        p={4}
        align={"center"}
        justify={"space-between"}
        borderBottom={"1px solid"}
        borderColor={"gray.800"}
      >
        <Flex align={"center"} gap={3}>
          <IconButton
            icon={<FiArrowLeft size={20} />}
            aria-label="Back to conversations"
            variant={"ghost"}
            size={"sm"}
            display={{ base: "flex", md: "none" }}
            onClick={onBack}
          />
          <Avatar
            src={otherUser?.profile_pic_url || "/profilepic.png"}
            name={otherUser?.full_name || otherUser?.username}
            size={"sm"}
          />
          <Box>
            <Text
              as={RouterLink}
              to={`/${otherUser?.username}`}
              fontSize={"sm"}
              fontWeight={"bold"}
              _hover={{ textDecoration: "underline" }}
            >
              {otherUser?.username || "user"}
            </Text>
            {otherUser?.full_name && (
              <Text fontSize={"xs"} color={"gray.400"}>
                {otherUser.full_name}
              </Text>
            )}
          </Box>
        </Flex>

        <Button
          as={RouterLink}
          to={`/${otherUser?.username}`}
          size={"xs"}
          variant={"outline"}
          borderColor={"gray.600"}
          _hover={{ bg: "whiteAlpha.200" }}
        >
          View profile
        </Button>
      </Flex>

      {/* Messages Feed */}
      <Box flex={1} overflowY={"auto"} p={6}>
        {isLoading ? (
          <Flex justify={"center"} align={"center"} h={"full"}>
            <Spinner size={"lg"} color={"blue.500"} />
          </Flex>
        ) : (
          <VStack spacing={3} align={"stretch"}>
            {/* Top user badge */}
            <Flex direction={"column"} align={"center"} my={6}>
              <Avatar
                src={otherUser?.profile_pic_url || "/profilepic.png"}
                name={otherUser?.full_name || otherUser?.username}
                size={"xl"}
                mb={2}
              />
              <Text fontWeight={"bold"} fontSize={"lg"}>
                {otherUser?.full_name || otherUser?.username}
              </Text>
              <Text color={"gray.400"} fontSize={"xs"}>
                {otherUser?.username} • Instagram
              </Text>
            </Flex>

            {messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;

              return (
                <Flex
                  key={msg.id || Math.random()}
                  justify={isMe ? "flex-end" : "flex-start"}
                  w={"full"}
                >
                  <Box
                    maxW={"70%"}
                    px={4}
                    py={2}
                    borderRadius={"2xl"}
                    bg={isMe ? "blue.500" : "gray.800"}
                    color={"white"}
                    fontSize={"sm"}
                    wordBreak={"break-word"}
                  >
                    <Text>{msg.text}</Text>
                  </Box>
                </Flex>
              );
            })}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* Input bar */}
      <Box p={4} borderTop={"1px solid"} borderColor={"gray.800"}>
        <form onSubmit={handleSendMessage}>
          <InputGroup size={"md"}>
            <Input
              placeholder="Message..."
              borderRadius={"full"}
              bg={"gray.900"}
              border={"1px solid"}
              borderColor={"gray.700"}
              _focus={{ borderColor: "blue.500" }}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              pr={"4.5rem"}
              autoFocus
            />
            <InputRightElement width={"4.5rem"}>
              <Button
                h={"1.75rem"}
                size={"sm"}
                variant={"ghost"}
                color={"blue.400"}
                type="submit"
                isLoading={isSending}
                isDisabled={!inputText.trim()}
                _hover={{ bg: "transparent", color: "blue.300" }}
              >
                <FiSend size={16} />
              </Button>
            </InputRightElement>
          </InputGroup>
        </form>
      </Box>
    </Flex>
  );
};

export default ChatArea;
