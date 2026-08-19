import { Box, Image } from "@chakra-ui/react";
import PostHeader from "./PostHeader";
import PostFooter from "./PostFooter";

const Feedpost = () => {
  return (
    <>
    <PostHeader />
    <Box>
      <Image src="/img1.png" alt="User profile pic"/>
    </Box>

    <PostFooter />
    
      
    </>
  );
};

export default Feedpost;