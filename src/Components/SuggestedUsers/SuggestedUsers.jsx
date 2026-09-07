import { Box, Flex, Link, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import SuggestedHeader from "./SuggestedHeader";
import SuggestedUser from "./SuggestedUser";
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

const SuggestedUsers = () => {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggested = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch other registered users from Supabase
        let query = supabase.from("users").select("*").limit(6);
        if (user?.id) {
          query = query.neq("id", user.id);
        }
        const { data: usersData, error } = await query;
        if (error) throw error;

        // 2. Fetch whom the current user follows
        if (user?.id) {
          const { data: followData } = await supabase
            .from("followers")
            .select("following_id")
            .eq("follower_id", user.id);

          const ids = new Set((followData || []).map((f) => f.following_id));
          setFollowingIds(ids);
        }

        if (usersData && usersData.length > 0) {
          // If fewer than 3 users exist, combine with curated suggestions
          if (usersData.length < 3) {
            setSuggestedUsers([...usersData, ...FALLBACK_SUGGESTIONS.slice(0, 3 - usersData.length)]);
          } else {
            setSuggestedUsers(usersData);
          }
        } else {
          setSuggestedUsers(FALLBACK_SUGGESTIONS);
        }
      } catch (err) {
        console.error("Error fetching suggested users:", err.message);
        setSuggestedUsers(FALLBACK_SUGGESTIONS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggested();
  }, [user]);

  return (
    <VStack py={8} px={6} gap={4} w={"full"}>
      <SuggestedHeader />

      <Flex alignItems={"center"} justifyContent={"space-between"} w={"full"} mt={2}>
        <Text fontSize={12} fontWeight={"bold"} color={"gray.500"}>
          Suggested for you
        </Text>
        <Text
          fontSize={12}
          fontWeight={"bold"}
          _hover={{ color: "gray.400" }}
          cursor={"pointer"}
        >
          See All
        </Text>
      </Flex>

      {isLoading ? (
        <Flex justify={"center"} py={4}>
          <Spinner size={"sm"} color={"blue.500"} />
        </Flex>
      ) : (
        suggestedUsers.map((targetUser) => (
          <SuggestedUser
            key={targetUser.id}
            user={targetUser}
            initialIsFollowing={followingIds.has(targetUser.id)}
          />
        ))
      )}

      <Box fontSize={12} color={"gray.500"} mt={5} alignSelf={"start"}>
        © 2026 Built By{" "}
        <Link
          href="https://github.com/01092005kunal"
          target="_blank"
          color="blue.500"
          fontSize={14}
        >
          Kunal Mhatre
        </Link>
      </Box>
    </VStack>
  );
};

export default SuggestedUsers;
