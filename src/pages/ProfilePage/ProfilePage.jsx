import { Container, Flex, Spinner, Text } from "@chakra-ui/react";
import ProfileHeader from "../../Components/Profile/ProfileHeader";
import ProfileTabs from "../../Components/Profile/ProfileTabs";
import ProfilePosts from "../../Components/Profile/ProfilePosts";
import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../Supabase/client";
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch user by username
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (userError || !userData) {
        setProfileUser(null);
        return;
      }
      setProfileUser(userData);

      // 2. Fetch posts by this user
      const { data: postsData } = await supabase
        .from("posts")
        .select("*, users(*), likes(*), comments(*, users(*))")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false });

      setPosts(postsData || []);

      // 3. Fetch followers count
      const { count: followers } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userData.id);
      setFollowersCount(followers || 0);

      // 4. Fetch following count
      const { count: following } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userData.id);
      setFollowingCount(following || 0);

      // 5. Check if logged-in user is following this profile
      if (user && user.id !== userData.id) {
        const { data: followData } = await supabase
          .from("followers")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", userData.id)
          .maybeSingle();

        setIsFollowing(!!followData);
      }
    } catch (err) {
      console.error("Error fetching profile page data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [username, user]);

  useEffect(() => {
    fetchProfileData();

    const handlePostCreated = () => {
      fetchProfileData();
    };
    window.addEventListener("post-created", handlePostCreated);
    return () => window.removeEventListener("post-created", handlePostCreated);
  }, [fetchProfileData]);

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  };

  if (isLoading) {
    return (
      <Flex justify={"center"} align={"center"} minH={"60vh"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!profileUser) {
    return (
      <Flex justify={"center"} align={"center"} minH={"60vh"} direction={"column"} gap={4}>
        <Text fontSize={"2xl"} fontWeight={"bold"}>
          User Not Found
        </Text>
        <Text color={"gray.500"}>The user @{username} does not exist.</Text>
      </Flex>
    );
  }

  return (
    <Container maxW="container.lg" py={5}>
      <Flex
        py={10}
        px={4}
        pl={{ base: 4, md: 10 }}
        w={"full"}
        mx={"auto"}
        flexDirection={"column"}
      >
        <ProfileHeader
          profileUser={profileUser}
          postsCount={posts.length}
          followersCount={followersCount}
          followingCount={followingCount}
          isFollowing={isFollowing}
          onFollowChange={(newStatus) => {
            setIsFollowing(newStatus);
            setFollowersCount((prev) => (newStatus ? prev + 1 : Math.max(0, prev - 1)));
          }}
          onProfileUpdated={fetchProfileData}
        />
      </Flex>
      <Flex
        px={{ base: 2, sm: 4 }}
        maxW={"full"}
        mx={"auto"}
        borderTop={"1px solid"}
        borderColor={"whiteAlpha.300"}
        direction={"column"}
      >
        <ProfileTabs />
        <ProfilePosts posts={posts} isLoading={isLoading} onPostDeleted={handlePostDeleted} />
      </Flex>
    </Container>
  );
};

export default ProfilePage;
