import { Avatar, Box, Button, Flex, Skeleton, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";

// Helper to calculate human-readable relative time
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "1w";
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "just now";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(days / 365)}y`;
};

const PostHeader = ({ post, username, avatar }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const authorId = post?.user_id || post?.users?.id;
  const isOwnPost = user && authorId && user.id === authorId;
  const timeAgo = formatTimeAgo(post?.created_at);

  useEffect(() => {
    if (!user?.id || !authorId || isOwnPost) return;

    const checkFollowStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("followers")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", authorId)
          .maybeSingle();

        if (!error && data) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };

    checkFollowStatus();
  }, [user?.id, authorId, isOwnPost]);

  const handleFollowToggle = async () => {
    if (!user || !authorId || isLoading || isOwnPost) return;
    setIsLoading(true);

    try {
      if (isFollowing) {
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", authorId);
        setIsFollowing(false);
      } else {
        await supabase
          .from("followers")
          .insert([{ follower_id: user.id, following_id: authorId }]);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Error toggling follow:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      justifyContent={"space-between"}
      alignItems={"center"}
      w={"full"}
      my={2}
    >
      <Flex alignItems={"center"} gap={2}>
        <Avatar
          as={RouterLink}
          to={`/${username}`}
          src={avatar}
          alt={username}
          size={"sm"}
          cursor={"pointer"}
        />
        <Flex fontSize={12} fontWeight={"bold"} gap={2} alignItems={"center"}>
          <Text
            as={RouterLink}
            to={`/${username}`}
            cursor={"pointer"}
            _hover={{ textDecoration: "underline" }}
            color={"white"}
          >
            {username}
          </Text>
          <Box color={"gray.500"} fontWeight={"normal"}>
            • {timeAgo}
          </Box>
        </Flex>
      </Flex>

      {!isOwnPost && authorId && (
        <Button
          size={"xs"}
          variant={"ghost"}
          fontSize={12}
          color={isFollowing ? "gray.400" : "blue.500"}
          fontWeight={"bold"}
          _hover={{ color: isFollowing ? "red.400" : "blue.400", bg: "transparent" }}
          transition={"0.2s ease-in-out"}
          onClick={handleFollowToggle}
          isLoading={isLoading}
          cursor={"pointer"}
          p={0}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}
    </Flex>
  );
};

export default PostHeader;
