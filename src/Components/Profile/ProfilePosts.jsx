import { Box, Flex, Grid, Skeleton, Text, VStack } from "@chakra-ui/react";
import ProfilePost from "./ProfilePost";

const ProfilePosts = ({ posts = [], isLoading = false, onPostDeleted }) => {
  return (
    <Box w={"full"} py={6}>
      <Grid
        templateColumns={{ sm: "repeat(1,1fr)", md: "repeat(3,1fr)" }}
        gap={1}
        columnGap={1}
      >
        {isLoading &&
          [0, 1, 2, 3, 4, 5].map((_, idx) => (
            <VStack key={idx} alignItems={"flex-start"} gap={4}>
              <Skeleton w={"full"}>
                <Box h="300px">contents wrapped</Box>
              </Skeleton>
            </VStack>
          ))}

        {!isLoading &&
          posts.map((post) => (
            <ProfilePost
              key={post.id}
              post={post}
              img={post.image_url}
              onPostDeleted={onPostDeleted}
            />
          ))}
      </Grid>

      {!isLoading && posts.length === 0 && (
        <Flex direction={"column"} align={"center"} justify={"center"} py={16} gap={2}>
          <Text fontSize={"xl"} fontWeight={"bold"} color={"gray.400"}>
            No Posts Yet
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default ProfilePosts;
