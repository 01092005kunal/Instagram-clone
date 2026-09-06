import { Box, Image } from "@chakra-ui/react";
import PostHeader from "./PostHeader";
import PostFooter from "./PostFooter";

const Feedpost = ({ post, img, username, avatar }) => {
  const displayImg = post?.image_url || img;
  const displayUsername = post?.users?.username || username || "user";
  const displayAvatar = post?.users?.profile_pic_url || avatar || "/profilepic.png";

  return (
    <>
      <PostHeader username={displayUsername} avatar={displayAvatar} />
      <Box my={2} borderRadius={5} overflow={"hidden"} maxH={"600px"} bg={"black"}>
        <Image src={displayImg} alt={displayUsername} w={"full"} objectFit={"cover"} />
      </Box>

      <PostFooter post={post} username={displayUsername} />
    </>
  );
};

export default Feedpost;
