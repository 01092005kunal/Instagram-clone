import {
  Avatar,
  Box,
  Divider,
  Flex,
  GridItem,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { AiFillHeart } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Comment } from "../Comment/Comment";
import PostFooter from "../FeedPosts/PostFooter";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";
import { useState } from "react";

const ProfilePost = ({ post, img, onPostDeleted }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const displayImg = post?.image_url || img;
  const username = post?.users?.username || "user";
  const avatar = post?.users?.profile_pic_url || "/profilepic.png";
  const likesCount = post?.likes?.length || 0;
  const commentsCount = post?.comments?.length || 0;
  const isOwner = user && post && user.id === post.user_id;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Post deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      onPostDeleted?.(post.id);
      window.dispatchEvent(new Event("post-created"));
    } catch (err) {
      toast({
        title: "Error deleting post",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <GridItem
        cursor={"pointer"}
        borderRadius={4}
        overflow={"hidden"}
        border={"1px solid"}
        borderColor={"whiteAlpha.300"}
        position={"relative"}
        aspectRatio={1 / 1}
        onClick={onOpen}
      >
        <Flex
          opacity={0}
          _hover={{ opacity: 1 }}
          position={"absolute"}
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={"blackAlpha.700"}
          transition={"all 0.3s ease"}
          zIndex={1}
          justifyContent={"center"}
        >
          <Flex alignItems={"center"} justifyContent={"center"} gap={50}>
            <Flex align={"center"}>
              <AiFillHeart size={20} />
              <Text fontWeight={"bold"} ml={2}>
                {likesCount}
              </Text>
            </Flex>
            <Flex align={"center"}>
              <FaComment size={20} />
              <Text fontWeight={"bold"} ml={2}>
                {commentsCount}
              </Text>
            </Flex>
          </Flex>
        </Flex>

        <Image
          src={displayImg}
          alt="profile post"
          w={"100%"}
          h={"100%"}
          objectFit={"cover"}
        />
      </GridItem>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered={true}
        size={{ base: "3xl", md: "5xl" }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody bg={"black"} pb={5}>
            <Flex
              gap="4"
              w={{ base: "90%", sm: "70%", md: "full" }}
              mx={"auto"}
              maxH={"90vh"}
            >
              <Box
                borderRadius={4}
                overflow={"hidden"}
                border={"1px solid"}
                borderColor={"whiteAlpha.300"}
                flex={1.5}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                bg={"black"}
              >
                <Image src={displayImg} alt="profile post" maxH={"600px"} objectFit={"contain"} />
              </Box>
              <Flex
                flex={1}
                flexDir={"column"}
                px={6}
                display={{ base: "none", md: "flex" }}
              >
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                  <Flex alignItems={"center"} gap={4}>
                    <Avatar src={avatar} size={"sm"} name={username} />
                    <Text fontWeight={"bold"} fontSize={14}>
                      {username}
                    </Text>
                  </Flex>

                  {isOwner && (
                    <Box
                      _hover={{ bg: "whiteAlpha.300", color: "red.600" }}
                      borderRadius={4}
                      p={1}
                      cursor={"pointer"}
                      onClick={isDeleting ? undefined : handleDelete}
                      opacity={isDeleting ? 0.5 : 1}
                    >
                      <MdDelete size={20} />
                    </Box>
                  )}
                </Flex>
                <Divider my={4} bg={"gray.500"} />
                <VStack
                  w="full"
                  alignItems={"start"}
                  maxH={"350px"}
                  overflowY={"auto"}
                  spacing={3}
                >
                  {post?.caption && (
                    <Comment
                      createdAt="Just now"
                      username={username}
                      profilePic={avatar}
                      text={post.caption}
                    />
                  )}

                  {post?.comments?.map((c, idx) => (
                    <Comment
                      key={c.id || idx}
                      createdAt="Recently"
                      username={c.users?.username || "user"}
                      profilePic={c.users?.profile_pic_url || "/profilepic.png"}
                      text={c.text}
                    />
                  ))}
                </VStack>

                <Divider my={4} bg={"gray.800"} />
                <PostFooter post={post} isProfilePage={true} />
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfilePost;
