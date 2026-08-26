import {
  Box,
  Container,
  Flex,
  Skeleton,
  SkeletonCircle,
  VStack,
} from "@chakra-ui/react";
import Feedpost from "./Feedpost";
import { useEffect, useState } from "react";

const FeedPosts = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading();
    }, 2000);
  }, []);
  return (
    <Container maxW={"container.sm"} py={10} px={2}>
      {isLoading &&
        [0, 1, 2, 3, 4].map((_, idx) => (
          <VStack key={idx} gap={4} alignItems={"flex-start"} mb={10}>
            <Flex gap="2">
              <SkeletonCircle size="10" />
              <VStack gap={2} alignItems={"flex-start"}>
                <Skeleton height="10px" w={"200px"} /> //loading screen effect
                <Skeleton height="10px" w={"200px"} />
              </VStack>
            </Flex>
            <Skeleton w={"full"}>
              <Box h={"500px"}>contents wrapped</Box>
            </Skeleton>
          </VStack>
        ))}
      {!isLoading && (
        <>
          <Feedpost img="/img1.png" username="kunalmhatre" avatar="/img1.png" />
          <Feedpost img="/img2.png" username="kunalmhatre" avatar="/img2.png" />
          <Feedpost img="/img3.png" username="kunalmhatre" avatar="/img3.png" />
          <Feedpost img="/img4.png" username="kunalmhatre" avatar="/img4.png" />
        </>
      )}
    </Container>
  );
};

export default FeedPosts;
