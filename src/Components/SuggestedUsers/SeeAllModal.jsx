import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";

const FALLBACK_SUGGESTIONS = [
  {
    id: "sample-1",
    username: "dan_abramov",
    full_name: "Dan Abramov",
    profile_pic_url: "https://bit.ly/dan-abramov",
    followersCount: 1392,
  },
  {
    id: "sample-2",
    username: "ryan_florence",
    full_name: "Ryan Florence",
    profile_pic_url: "https://bit.ly/ryan-florence",
    followersCount: 759,
  },
  {
    id: "sample-3",
    username: "christian_nwamba",
    full_name: "Christian Nwamba",
    profile_pic_url: "https://bit.ly/code-beast",
    followersCount: 567,
  },
];

const SeeAllModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadAllUsers = async () => {
      setIsLoading(true);
      setSearchQuery("");
      try {
        // 1. Fetch all users from database
        let query = supabase.from("users").select("*");
        if (user?.id) {
          query = query.neq("id", user.id);
        }
        const { data: usersData, error } = await query;
        if (error) throw error;

        // 2. Fetch following relationships
        if (user?.id) {
          const { data: followData } = await supabase
            .from("followers")
            .select("following_id")
            .eq("follower_id", user.id);

          const ids = new Set((followData || []).map((f) => f.following_id));
          setFollowingIds(ids);
        }

        if (usersData && usersData.length > 0) {
          // If fewer than 3 registered users, mix in fallback demo users
          if (usersData.length < 3) {
            setAllUsers([...usersData, ...FALLBACK_SUGGESTIONS.slice(0, 3 - usersData.length)]);
          } else {
            setAllUsers(usersData);
          }
        } else {
          setAllUsers(FALLBACK_SUGGESTIONS);
        }
      } catch (err) {
        console.error("Error loading suggested users:", err.message);
        setAllUsers(FALLBACK_SUGGESTIONS);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllUsers();
  }, [isOpen, user]);

  const handleFollowToggle = async (targetUser) => {
    if (!user || !targetUser?.id) return;
    setLoadingActionId(targetUser.id);

    const isCurrentlyFollowing = followingIds.has(targetUser.id);

    try {
      if (isCurrentlyFollowing) {
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUser.id);

        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(targetUser.id);
          return next;
        });
      } else {
        await supabase
          .from("followers")
          .insert([{ follower_id: user.id, following_id: targetUser.id }]);

        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.add(targetUser.id);
          return next;
        });
      }
    } catch (err) {
      console.error("Error toggling follow:", err.message);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleUserClick = (username) => {
    onClose();
    navigate(`/${username}`);
  };

  const filteredUsers = allUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesUsername = u.username?.toLowerCase().includes(q);
    const matchesName = u.full_name?.toLowerCase().includes(q);
    return matchesUsername || matchesName;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"md"}>
      <ModalOverlay bg={"blackAlpha.700"} backdropFilter={"blur(3px)"} />
      <ModalContent
        bg={"#121212"}
        border={"1px solid #262626"}
        color={"white"}
        borderRadius={"xl"}
        maxH={"80vh"}
      >
        <ModalHeader
          borderBottom={"1px solid #262626"}
          textAlign={"center"}
          fontSize={"md"}
          fontWeight={"bold"}
          py={3}
        >
          Suggested for you
        </ModalHeader>
        <ModalCloseButton color={"gray.400"} _hover={{ color: "white" }} />

        <ModalBody p={4} display={"flex"} flexDirection={"column"} gap={3}>
          {/* Search box */}
          <InputGroup size={"sm"} my={1}>
            <InputLeftElement pointerEvents={"none"}>
              <FiSearch color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search suggested users..."
              bg={"#262626"}
              border={"none"}
              borderRadius={"md"}
              _focus={{ bg: "#303030", borderColor: "blue.500" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          {/* User List */}
          <Box overflowY={"auto"} maxH={"380px"} pr={1}>
            {isLoading ? (
              <Flex justify={"center"} align={"center"} py={10}>
                <Spinner size={"lg"} color={"blue.500"} />
              </Flex>
            ) : filteredUsers.length === 0 ? (
              <Flex direction={"column"} align={"center"} justify={"center"} py={10}>
                <Text color={"gray.400"} fontSize={"sm"}>
                  {searchQuery ? "No accounts found" : "No suggestions available"}
                </Text>
              </Flex>
            ) : (
              <VStack spacing={3} align={"stretch"}>
                {filteredUsers.map((targetUser) => {
                  const isFollowing = followingIds.has(targetUser.id);

                  return (
                    <Flex
                      key={targetUser.id}
                      align={"center"}
                      justify={"space-between"}
                      p={2}
                      borderRadius={"md"}
                      _hover={{ bg: "#1f1f1f" }}
                      transition={"background 0.2s"}
                    >
                      <Flex
                        align={"center"}
                        gap={3}
                        cursor={"pointer"}
                        onClick={() => handleUserClick(targetUser.username)}
                        flex={1}
                      >
                        <Avatar
                          size={"sm"}
                          src={targetUser.profile_pic_url || "/profilepic.png"}
                          name={targetUser.full_name || targetUser.username}
                        />
                        <Flex direction={"column"}>
                          <Text
                            fontSize={"sm"}
                            fontWeight={"bold"}
                            lineHeight={"short"}
                            _hover={{ textDecoration: "underline" }}
                          >
                            {targetUser.username}
                          </Text>
                          <Text fontSize={"xs"} color={"gray.400"}>
                            {targetUser.full_name || "Suggested for you"}
                          </Text>
                        </Flex>
                      </Flex>

                      <Button
                        size={"xs"}
                        px={3}
                        fontSize={"xs"}
                        fontWeight={"semibold"}
                        isLoading={loadingActionId === targetUser.id}
                        onClick={() => handleFollowToggle(targetUser)}
                        bg={isFollowing ? "transparent" : "blue.500"}
                        color={"white"}
                        border={isFollowing ? "1px solid #363636" : "none"}
                        _hover={{
                          bg: isFollowing ? "whiteAlpha.200" : "blue.600",
                        }}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    </Flex>
                  );
                })}
              </VStack>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SeeAllModal;
