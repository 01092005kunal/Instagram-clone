import { Container } from "@chakra-ui/react";
import Feedpost from "./Feedpost";

const FeedPosts = () => {
  return (
    <Container maxW={"container.sm"} py={10} px={2}>
      <Feedpost />
      <Feedpost />
      <Feedpost />
      <Feedpost />
      <Feedpost />
    </Container>
  );
};

export default FeedPosts;