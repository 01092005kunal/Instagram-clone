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

const FollowListModal = ({ isOpen, onClose, userId, type = "followers" }) => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loadingActionId, setLoadingActionId] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      setSearchQuery("");
      try {
        let userIds = [];

        if (type === "followers") {
          // Fetch users who follow this profile
          const { data: rows, error } = await supabase
            .from("followers")
            .select("follower_id")
            .eq("following_id", userId);
          if (error) throw error;
          userIds = (rows || []).map((r) => r.follower_id);
        } else {
          // Fetch users whom this profile follows
          const { data: rows, error } = await supabase
            .from("followers")
            .select("following_id")
            .eq("follower_id", userId);
          if (error) throw error;
          userIds = (rows || []).map((r) => r.following_id);
        }

        if (userIds.length > 0) {
          // Fetch user details for all matched IDs
          const { data: profiles, error: usersErr } = await supabase
            .from("users")
            .select("id, username, full_name, profile_pic_url")
            .in("id", userIds);
          if (usersErr) throw usersErr;
          setUsersList(profiles || []);
        } else {
          setUsersList([]);
        }

        // Fetch whom the current authenticated user is following
        if (authUser?.id) {
          const { data: myFollows } = await supabase
            .from("followers")
            .select("following_id")
            .eq("follower_id", authUser.id);
          const followSet = new Set((myFollows || []).map((f) => f.following_id));
          setFollowingIds(followSet);
        }
      } catch (err) {
        console.error(`Error fetching ${type}:`, err.message);
        setUsersList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type, authUser?.id]);

  const handleFollowToggle = async (targetUser) => {
    if (!authUser || !targetUser) return;
    setLoadingActionId(targetUser.id);

    const isCurrentlyFollowing = followingIds.has(targetUser.id);

    try {
      if (isCurrentlyFollowing) {
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", authUser.id)
          .eq("following_id", targetUser.id);

        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(targetUser.id);
          return next;
        });
      } else {
        await supabase
          .from("followers")
          .insert([{ follower_id: authUser.id, following_id: targetUser.id }]);

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

  const filteredUsers = usersList.filter((u) => {
    const query = searchQuery.toLowerCase();
    const usernameMatch = u.username?.toLowerCase().includes(query);
    const nameMatch = u.full_name?.toLowerCase().includes(query);
    return usernameMatch || nameMatch;
  });

  const modalTitle = type === "followers" ? "Followers" : "Following";

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
          {modalTitle}
        </ModalHeader>
        <ModalCloseButton color={"gray.400"} _hover={{ color: "white" }} />

        <ModalBody p={4} display={"flex"} flexDirection={"column"} gap={3}>
          {/* Search bar inside modal */}
          {usersList.length > 0 && (
            <InputGroup size={"sm"} my={1}>
              <InputLeftElement pointerEvents={"none"}>
                <FiSearch color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Search..."
                bg={"#262626"}
                border={"none"}
                borderRadius={"md"}
                _focus={{ bg: "#303030", borderColor: "blue.500" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          )}

          {/* User List */}
          <Box overflowY={"auto"} maxH={"360px"} pr={1}>
            {isLoading ? (
              <Flex justify={"center"} align={"center"} py={10}>
                <Spinner size={"lg"} color={"blue.500"} />
              </Flex>
            ) : filteredUsers.length === 0 ? (
              <Flex direction={"column"} align={"center"} justify={"center"} py={10}>
                <Text color={"gray.400"} fontSize={"sm"}>
                  {searchQuery
                    ? "No users found"
                    : type === "followers"
                    ? "No followers yet"
                    : "Not following anyone yet"}
                </Text>
              </Flex>
            ) : (
              <VStack spacing={3} align={"stretch"}>
                {filteredUsers.map((u) => {
                  const isMe = authUser?.id === u.id;
                  const isFollowingUser = followingIds.has(u.id);

                  return (
                    <Flex
                      key={u.id}
                      align={"center"}
                      justify={"space-between"}
                      p={1.5}
                      borderRadius={"md"}
                      _hover={{ bg: "#1f1f1f" }}
                      transition={"background 0.2s"}
                    >
                      <Flex
                        align={"center"}
                        gap={3}
                        cursor={"pointer"}
                        onClick={() => handleUserClick(u.username)}
                        flex={1}
                      >
                        <Avatar
                          size={"sm"}
                          src={u.profile_pic_url || "/profilepic.png"}
                          name={u.full_name || u.username}
                        />
                        <Flex direction={"column"}>
                          <Text
                            fontSize={"sm"}
                            fontWeight={"bold"}
                            lineHeight={"short"}
                            _hover={{ textDecoration: "underline" }}
                          >
                            {u.username}
                          </Text>
                          {u.full_name && (
                            <Text fontSize={"xs"} color={"gray.400"}>
                              {u.full_name}
                            </Text>
                          )}
                        </Flex>
                      </Flex>

                      {/* Follow/Unfollow Action Button */}
                      {authUser && !isMe && (
                        <Button
                          size={"xs"}
                          px={3}
                          fontSize={"xs"}
                          fontWeight={"semibold"}
                          isLoading={loadingActionId === u.id}
                          onClick={() => handleFollowToggle(u)}
                          bg={isFollowingUser ? "transparent" : "blue.500"}
                          color={"white"}
                          border={isFollowingUser ? "1px solid #363636" : "none"}
                          _hover={{
                            bg: isFollowingUser ? "whiteAlpha.200" : "blue.600",
                          }}
                        >
                          {isFollowingUser ? "Following" : "Follow"}
                        </Button>
                      )}
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

export default FollowListModal;
