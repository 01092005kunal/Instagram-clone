import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import {
  CommentLogo,
  NotificationsLogo,
  UnlikeLogo,
} from "../../assets/constants";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../Supabase/client";

const PostFooter = ({ post, username, isProfilePage }) => {
  const { user } = useAuth();
  const initialLikes = post?.likes || [];
  const [likesCount, setLikesCount] = useState(initialLikes.length);
  const [isLiked, setIsLiked] = useState(
    initialLikes.some((like) => like.user_id === user?.id)
  );
  const [comments, setComments] = useState(post?.comments || []);
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const commentRef = useRef(null);

  useEffect(() => {
    if (post?.likes) {
      setLikesCount(post.likes.length);
      setIsLiked(post.likes.some((like) => like.user_id === user?.id));
    }
    if (post?.comments) {
      setComments(post.comments);
    }
  }, [post, user]);

  const handleLike = async () => {
    if (!user || !post?.id) return;
    try {
      if (isLiked) {
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
      } else {
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
        await supabase
          .from("likes")
          .insert([{ post_id: post.id, user_id: user.id }]);
      }
    } catch (err) {
      console.error("Like toggle error:", err.message);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !user || !post?.id) return;
    setIsCommenting(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: post.id,
            user_id: user.id,
            text: comment.trim(),
          },
        ])
        .select("*, users(*)")
        .single();

      if (error) throw error;
      setComments((prev) => [...prev, data]);
      setComment("");
    } catch (err) {
      console.error("Comment submit error:", err.message);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <Box mb={10} marginTop={"auto"}>
      <Flex alignItems={"center"} gap={4} w={"full"} pt={0} mb={2} mt={4}>
        <Box onClick={handleLike} cursor={"pointer"} fontSize={18}>
          {!isLiked ? <NotificationsLogo /> : <UnlikeLogo />}
        </Box>

        <Box cursor={"pointer"} fontSize={18} onClick={() => commentRef.current?.focus()}>
          <CommentLogo />
        </Box>
      </Flex>

      <Text fontWeight={600} fontSize={"sm"}>
        {likesCount} likes
      </Text>

      {!isProfilePage && (
        <>
          {post?.caption && (
            <Flex gap={2} my={1}>
              <Text fontSize="sm" fontWeight={700}>
                {username || post?.users?.username || "user"}
              </Text>
              <Text fontSize="sm" fontWeight={400}>
                {post.caption}
              </Text>
            </Flex>
          )}

          {comments.length > 0 && (
            <Text
              fontSize="sm"
              color={"gray.500"}
              cursor={"pointer"}
              my={1}
              onClick={() => setShowAllComments(!showAllComments)}
            >
              {showAllComments
                ? "Hide comments"
                : `View all ${comments.length} comments`}
            </Text>
          )}

          {showAllComments && (
            <VStack align={"start"} spacing={1} maxH={"120px"} overflowY={"auto"} my={2}>
              {comments.map((c, idx) => (
                <Flex key={c.id || idx} gap={2} fontSize={"sm"}>
                  <Text fontWeight={700}>{c.users?.username || "user"}</Text>
                  <Text>{c.text}</Text>
                </Flex>
              ))}
            </VStack>
          )}
        </>
      )}

      <Flex alignItems={"center"} gap={2} justifyContent={"space-between"} w={"full"}>
        <InputGroup>
          <Input
            variant={"flushed"}
            placeholder={"Add a comment..."}
            fontSize={14}
            onChange={(e) => setComment(e.target.value)}
            value={comment}
            ref={commentRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitComment();
            }}
          />
          <InputRightElement>
            <Button
              fontSize={14}
              color={"blue.500"}
              fontWeight={600}
              cursor={"pointer"}
              _hover={{ color: "white" }}
              bg={"transparent"}
              onClick={handleSubmitComment}
              isLoading={isCommenting}
              isDisabled={!comment.trim()}
            >
              Post
            </Button>
          </InputRightElement>
        </InputGroup>
      </Flex>
    </Box>
  );
};

export default PostFooter;
