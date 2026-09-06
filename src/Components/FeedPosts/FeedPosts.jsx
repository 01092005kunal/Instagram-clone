import {
  Box,
  Container,
  Flex,
  Skeleton,
  SkeletonCircle,
  Text,
  VStack,
} from "@chakra-ui/react";
import Feedpost from "./Feedpost";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../Supabase/client";

const FeedPosts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const getPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, users(*), likes(*), comments(*, users(*))")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getPosts();

    // Listen for custom post creation event from CreatePostModal
    const handlePostCreated = () => {
      getPosts();
    };
    window.addEventListener("post-created", handlePostCreated);

    return () => {
      window.removeEventListener("post-created", handlePostCreated);
    };
  }, [getPosts]);

  return (
    <Container maxW={"container.sm"} py={10} px={2}>
      {isLoading &&
        [0, 1, 2].map((_, idx) => (
          <VStack key={idx} gap={4} alignItems={"flex-start"} mb={10}>
            <Flex gap="2">
              <SkeletonCircle size="10" />
              <VStack gap={2} alignItems={"flex-start"}>
                <Skeleton height="10px" w={"200px"} />
                <Skeleton height="10px" w={"140px"} />
              </VStack>
            </Flex>
            <Skeleton w={"full"}>
              <Box h={"400px"}>contents wrapped</Box>
            </Skeleton>
          </VStack>
        ))}

      {!isLoading && posts.length > 0 && (
        posts.map((post) => (
          <Feedpost key={post.id} post={post} />
        ))
      )}

      {!isLoading && posts.length === 0 && (
        <Flex direction={"column"} align={"center"} justify={"center"} py={16} gap={3}>
          <Text fontSize={"lg"} fontWeight={600} color={"gray.400"}>
            No posts yet
          </Text>
          <Text fontSize={"sm"} color={"gray.500"}>
            Click "Create" on the sidebar to share your first photo!
          </Text>
        </Flex>
      )}
    </Container>
  );
};

export default FeedPosts;
