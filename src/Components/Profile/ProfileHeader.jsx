import {
  Avatar,
  AvatarGroup,
  Button,
  Flex,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";

const ProfileHeader = ({
  profileUser,
  postsCount = 0,
  followersCount = 0,
  followingCount = 0,
  isFollowing = false,
  onFollowChange,
}) => {
  const { user } = useAuth();
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwnProfile = user && profileUser && user.id === profileUser.id;

  const handleFollowToggle = async () => {
    if (!user || !profileUser) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profileUser.id);
        onFollowChange?.(false);
      } else {
        await supabase
          .from("followers")
          .insert([{ follower_id: user.id, following_id: profileUser.id }]);
        onFollowChange?.(true);
      }
    } catch (err) {
      console.error("Follow error:", err.message);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <Flex
      gap={{ base: 4, sm: 10 }}
      py={10}
      direction={{ base: "column", sm: "row" }}
    >
      <AvatarGroup
        size={{ base: "xl", md: "2xl" }}
        justifySelf={"center"}
        alignSelf={"flex-start"}
        mx={"auto"}
      >
        <Avatar
          name={profileUser?.full_name || profileUser?.username}
          src={profileUser?.profile_pic_url || "/profilepic.png"}
          alt="Profile picture"
        />
      </AvatarGroup>

      <VStack alignItems={"start"} gap={2} mx={"auto"} flex={1}>
        <Flex
          justifyContent={{ base: "center", sm: "flex-start" }}
          alignItems={"center"}
          w={"full"}
          gap={12}
        >
          <Text fontSize={{ base: "sm", md: "lg" }}>{profileUser?.username}</Text>

          <Flex gap={4} alignItems={"center"} justifyContent={"center"}>
            {isOwnProfile ? (
              <Button
                bg={"white"}
                color={"black"}
                _hover={{ bg: "whiteAlpha.800" }}
                size={{ base: "xs", md: "sm" }}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                bg={isFollowing ? "transparent" : "blue.500"}
                color={"white"}
                border={isFollowing ? "1px solid gray" : "none"}
                _hover={{ bg: isFollowing ? "whiteAlpha.200" : "blue.600" }}
                size={{ base: "xs", md: "sm" }}
                onClick={handleFollowToggle}
                isLoading={isFollowLoading}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </Flex>
        </Flex>

        <Flex alignItems={"center"} gap={{ base: 4, sm: 8 }}>
          <Text fontSize={{ base: "xs", md: "sm" }}>
            <Text as="span" fontWeight={"bold"} mr={1}>
              {postsCount}
            </Text>
            posts
          </Text>
          <Text fontSize={{ base: "xs", md: "sm" }}>
            <Text as="span" fontWeight={"bold"} mr={1}>
              {followersCount}
            </Text>
            followers
          </Text>
          <Text fontSize={{ base: "xs", md: "sm" }}>
            <Text as="span" fontWeight={"bold"} mr={1}>
              {followingCount}
            </Text>
            following
          </Text>
        </Flex>

        {profileUser?.full_name && (
          <Flex>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {profileUser.full_name}
            </Text>
          </Flex>
        )}

        {profileUser?.bio && (
          <Text fontSize={"sm"} color={"gray.300"}>
            {profileUser.bio}
          </Text>
        )}
      </VStack>
    </Flex>
  );
};

export default ProfileHeader;
