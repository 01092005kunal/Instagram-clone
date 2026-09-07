import { Flex } from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConversationList from "../../Components/Messages/ConversationList";
import ChatArea from "../../Components/Messages/ChatArea";
import { supabase } from "../../Supabase/client";

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);

  const fetchConversationById = useCallback(async (id) => {
    try {
      const { data: conv, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && conv) {
        const { data: usersData } = await supabase
          .from("users")
          .select("*")
          .in("id", [conv.user1_id, conv.user2_id]);

        const usersMap = (usersData || []).reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {});

        setSelectedConversation({
          ...conv,
          user1: usersMap[conv.user1_id] || { username: "user" },
          user2: usersMap[conv.user2_id] || { username: "user" },
        });
      }
    } catch (err) {
      console.error("Error fetching conversation:", err);
    }
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchConversationById(conversationId);
    } else {
      setSelectedConversation(null);
    }
  }, [conversationId, fetchConversationById]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    if (conv?.id) {
      navigate(`/direct/${conv.id}`);
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
    navigate("/direct");
  };

  return (
    <Flex h={"100vh"} w={"full"} overflow={"hidden"}>
      <ConversationList
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
      />
      <ChatArea conversation={selectedConversation} onBack={handleBack} />
    </Flex>
  );
};

export default MessagesPage;
