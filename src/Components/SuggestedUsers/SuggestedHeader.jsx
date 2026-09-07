import { Avatar, Button, Flex, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SuggestedHeader = () => {
  const { userProfile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"} w={"full"}>
      <Flex
        as={RouterLink}
        to={userProfile?.username ? `/${userProfile.username}` : "/"}
        alignItems={"center"}
        gap={3}
        cursor={"pointer"}
        _hover={{ opacity: 0.8 }}
      >
        <Avatar
          name={userProfile?.full_name || userProfile?.username || "User"}
          size={"md"}
          src={userProfile?.profile_pic_url || "/profilepic.png"}
        />
        <Flex direction={"column"}>
          <Text fontSize={13} fontWeight={"bold"} color={"white"}>
            {userProfile?.username || "user"}
          </Text>
          <Text fontSize={12} color={"gray.400"}>
            {userProfile?.full_name || ""}
          </Text>
        </Flex>
      </Flex>
      <Button
        size={"xs"}
        variant={"ghost"}
        fontSize={12}
        fontWeight={"medium"}
        color={"blue.400"}
        _hover={{ color: "white", bg: "transparent" }}
        cursor={"pointer"}
        onClick={handleLogout}
      >
        Log out
      </Button>
    </Flex>
  );
};

export default SuggestedHeader;
