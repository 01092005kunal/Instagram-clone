import {
  Avatar,
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { AiFillHeart } from "react-icons/ai";
import { FaComment, FaPlay } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { supabase } from "../../Supabase/client";
import PostFooter from "../../Components/FeedPosts/PostFooter";

const EXPLORE_SAMPLES = [
  {
    id: "ex-1",
    image_url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800",
    caption: "Sunlit mornings in the wild 🌿",
    users: { username: "nature_lens", profile_pic_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
    likes: [{ id: "1" }, { id: "2" }],
    comments: [{ id: "c1", text: "Stunning shot!" }],
    isVideo: true,
  },
  {
    id: "ex-2",
    image_url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
    caption: "The open highway calls 🚙",
    users: { username: "roadtrip_daily", profile_pic_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    likes: [{ id: "1" }],
    comments: [],
  },
  {
    id: "ex-3",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    caption: "Coastal serenity 🏖️",
    users: { username: "oceanvibes", profile_pic_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100" },
    likes: [{ id: "1" }, { id: "2" }, { id: "3" }],
    comments: [{ id: "c2", text: "Take me there!" }],
  },
  {
    id: "ex-4",
    image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
    caption: "Cyberpunk street energy ⚡",
    users: { username: "urban_street", profile_pic_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    likes: [{ id: "1" }, { id: "2" }],
    comments: [],
    isVideo: true,
  },
  {
    id: "ex-5",
    image_url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800",
    caption: "Geometric architecture marvels 🏢",
    users: { username: "arch_daily", profile_pic_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    likes: [{ id: "1" }],
    comments: [],
  },
  {
    id: "ex-6",
    image_url: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800",
    caption: "Alpine hike at 3,000 meters ⛰️",
    users: { username: "alps_explorer", profile_pic_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    likes: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }],
    comments: [],
  },
];

const ExplorePage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchExploreItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch community posts from Supabase
      const { data: dbPosts } = await supabase
        .from("posts")
        .select("*, users(*), likes(*), comments(*, users(*))")
        .order("created_at", { ascending: false });

      // Combine community posts with sample explore tiles
      const combined = [...(dbPosts || []), ...EXPLORE_SAMPLES];
      setItems(combined);
    } catch (err) {
      console.error("Error fetching explore items:", err);
      setItems(EXPLORE_SAMPLES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExploreItems();
  }, [fetchExploreItems]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.caption?.toLowerCase().includes(query) ||
      item.users?.username?.toLowerCase().includes(query)
    );
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onOpen();
  };

  return (
    <Container maxW={"container.lg"} py={6}>
      {/* Search Header */}
      <Flex justify={"center"} mb={8}>
        <InputGroup maxW={"420px"}>
          <InputLeftElement pointerEvents={"none"}>
            <FiSearch color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Search posts or creators..."
            bg={"gray.900"}
            borderRadius={"xl"}
            border={"1px solid"}
            borderColor={"gray.800"}
            _focus={{ borderColor: "blue.500" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </Flex>

      {/* Explore Grid */}
      {isLoading ? (
        <Flex justify={"center"} py={20}>
          <Spinner size={"xl"} color={"blue.500"} />
        </Flex>
      ) : (
        <Grid
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
          gap={3}
          autoRows={"280px"}
        >
          {filteredItems.map((item, index) => {
            // Stagger layout: every 5th item spans 2 rows for reels effect
            const isTall = index % 5 === 2;

            return (
              <GridItem
                key={item.id || index}
                rowSpan={{ base: 1, md: isTall ? 2 : 1 }}
                position={"relative"}
                borderRadius={"md"}
                overflow={"hidden"}
                cursor={"pointer"}
                onClick={() => handleItemClick(item)}
                role="group"
              >
                <Image
                  src={item.image_url}
                  alt={item.caption || "Explore post"}
                  w={"full"}
                  h={"full"}
                  objectFit={"cover"}
                  transition={"transform 0.3s ease"}
                  _groupHover={{ transform: "scale(1.03)" }}
                />

                {/* Video Play Badge if it's a reel */}
                {item.isVideo && (
                  <Box position={"absolute"} top={3} right={3} color={"white"} zIndex={1}>
                    <FaPlay size={16} />
                  </Box>
                )}

                {/* Hover Overlay */}
                <Flex
                  position={"absolute"}
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg={"blackAlpha.700"}
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  transition={"opacity 0.2s ease"}
                  justify={"center"}
                  align={"center"}
                  gap={8}
                  zIndex={2}
                >
                  <Flex align={"center"} color={"white"} gap={2}>
                    <AiFillHeart size={22} />
                    <Text fontWeight={"bold"}>{item.likes?.length || 0}</Text>
                  </Flex>
                  <Flex align={"center"} color={"white"} gap={2}>
                    <FaComment size={20} />
                    <Text fontWeight={"bold"}>{item.comments?.length || 0}</Text>
                  </Flex>
                </Flex>
              </GridItem>
            );
          })}
        </Grid>
      )}

      {/* Post Modal Detail */}
      {selectedItem && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={"4xl"}>
          <ModalOverlay />
          <ModalContent bg={"#121212"} border={"1px solid"} borderColor={"gray.800"}>
            <ModalCloseButton />
            <ModalBody p={0}>
              <Flex direction={{ base: "column", md: "row" }} maxH={"85vh"}>
                <Box flex={1.3} bg={"black"} display={"flex"} align={"center"} justify={"center"}>
                  <Image
                    src={selectedItem.image_url}
                    alt="Post"
                    maxH={"550px"}
                    w={"full"}
                    objectFit={"contain"}
                  />
                </Box>
                <Flex flex={1} direction={"column"} p={5} justify={"space-between"}>
                  <Box>
                    <Flex align={"center"} gap={3} pb={4} borderBottom={"1px solid"} borderColor={"gray.800"}>
                      <Avatar
                        as={RouterLink}
                        to={`/${selectedItem.users?.username}`}
                        src={selectedItem.users?.profile_pic_url || "/profilepic.png"}
                        name={selectedItem.users?.username}
                        size={"sm"}
                      />
                      <Text
                        as={RouterLink}
                        to={`/${selectedItem.users?.username}`}
                        fontWeight={"bold"}
                        fontSize={"sm"}
                        _hover={{ textDecoration: "underline" }}
                      >
                        {selectedItem.users?.username || "user"}
                      </Text>
                    </Flex>
                    {selectedItem.caption && (
                      <Flex gap={2} my={4}>
                        <Text fontSize={"sm"} fontWeight={"bold"}>
                          {selectedItem.users?.username || "user"}:
                        </Text>
                        <Text fontSize={"sm"} color={"gray.300"}>
                          {selectedItem.caption}
                        </Text>
                      </Flex>
                    )}
                  </Box>
                  <PostFooter post={selectedItem} isProfilePage={true} />
                </Flex>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ExplorePage;
