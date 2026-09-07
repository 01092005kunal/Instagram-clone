import { Avatar, Box, Button, Flex, VStack, Link } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";

const SuggestedUser = ({ user: targetUser, initialIsFollowing = false }) => {
  const { user } = useAuth();
  const [isFollowed, setIsFollowed] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(targetUser.followersCount || 1);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!user || !targetUser?.id) return;
    setIsLoading(true);
    try {
      if (isFollowed) {
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUser.id);
        setIsFollowed(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        await supabase
          .from("followers")
          .insert([{ follower_id: user.id, following_id: targetUser.id }]);
        setIsFollowed(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling follow:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"} w={"full"}>
      <Flex
        as={RouterLink}
        to={`/${targetUser.username}`}
        alignItems={"center"}
        gap={3}
        cursor={"pointer"}
        _hover={{ opacity: 0.8 }}
      >
        <Avatar
          src={targetUser.profile_pic_url || "/profilepic.png"}
          name={targetUser.full_name || targetUser.username}
          size={"sm"}
        />
        <VStack spacing={0} alignItems={"flex-start"}>
          <Box fontSize={12} fontWeight={"bold"} color={"white"}>
            {targetUser.username}
          </Box>
          <Box fontSize={11} color={"gray.500"}>
            {targetUser.full_name || `${followersCount} followers`}
          </Box>
        </VStack>
      </Flex>
      <Button
        fontSize={12}
        bg={"transparent"}
        p={0}
        h={"max"}
        fontWeight={"bold"}
        color={isFollowed ? "gray.400" : "blue.400"}
        cursor={"pointer"}
        _hover={{ color: isFollowed ? "red.400" : "white" }}
        onClick={handleFollowToggle}
        isLoading={isLoading}
      >
        {isFollowed ? "Following" : "Follow"}
      </Button>
    </Flex>
  );
};

export default SuggestedUser;
