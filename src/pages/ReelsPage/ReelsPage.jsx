import { Box, Flex, Spinner, Text, Badge, CloseButton, Button } from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import ReelCard from "../../Components/Reels/ReelCard";

const FALLBACK_REELS = [
  {
    id: "local-reel-1",
    videoUrl: "/videos/reel1.mp4",
    poster: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    username: "ocean_lens",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    caption: "Deep blue underwater serenity 🐢🌊 #oceanlife #wildlife",
    audioTitle: "Ludovico Einaudi - Experience",
    likes: 4820,
    comments: 214,
  },
  {
    id: "local-reel-2",
    videoUrl: "/videos/reel2.mp4",
    poster: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500",
    username: "golden_pup",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
    caption: "Pure canine joy in the park 🐶🐾 #dogsofinstagram",
    audioTitle: "Happy Vibes • Sunny Day",
    likes: 9230,
    comments: 540,
  },
  {
    id: "local-reel-3",
    videoUrl: "/videos/reel3.mp4",
    poster: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=500",
    username: "safari_explorer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    caption: "Majestic giants on the savanna 🐘🌍 #safari #wildlife",
    audioTitle: "Into the Wild • Cinematic Audio",
    likes: 7450,
    comments: 310,
  },
];

const ReelsPage = () => {
  const [reels, setReels] = useState(FALLBACK_REELS);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const pexelsApiKey = import.meta.env.VITE_PEXELS_API_KEY;

  const fetchPexelsReels = useCallback(async () => {
    if (!pexelsApiKey) return;
    setLoading(true);
    try {
      const response = await fetch(
        "https://api.pexels.com/videos/popular?orientation=portrait&per_page=15",
        {
          headers: {
            Authorization: pexelsApiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.videos && data.videos.length > 0) {
        const mapped = data.videos.map((v) => {
          // Choose suitable portrait MP4 file (prefer 540x960 or 720p for fast playback)
          const file =
            v.video_files.find((f) => f.quality === "sd" && f.width <= 720) ||
            v.video_files.find((f) => f.file_type === "video/mp4") ||
            v.video_files[0];

          return {
            id: `pexels-${v.id}`,
            videoUrl: file?.link || "",
            poster: v.image,
            username: (v.user?.name || "creator").toLowerCase().replace(/\s+/g, "_"),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.user?.name || "creator"}`,
            caption: `${v.user?.name || "Creator"} on Pexels ✨ #reels #explore`,
            audioTitle: "Trending Audio • Original Sound",
            likes: Math.floor(Math.random() * 6000) + 800,
            comments: Math.floor(Math.random() * 300) + 15,
          };
        });
        setReels(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch live Pexels reels, falling back to curated streams:", err);
    } finally {
      setLoading(false);
    }
  }, [pexelsApiKey]);

  useEffect(() => {
    if (pexelsApiKey) {
      fetchPexelsReels();
    }
  }, [fetchPexelsReels, pexelsApiKey]);

  return (
    <Flex justify={"center"} w={"full"} h={"100vh"} bg={"#000"} position={"relative"}>
      {/* Optional Pexels Banner */}
      {!pexelsApiKey && showBanner && (
        <Flex
          position={"fixed"}
          top={4}
          zIndex={10}
          bg={"rgba(20, 20, 20, 0.85)"}
          backdropFilter={"blur(8px)"}
          border={"1px solid"}
          borderColor={"whiteAlpha.300"}
          borderRadius={"full"}
          px={4}
          py={1.5}
          align={"center"}
          gap={3}
          boxShadow={"lg"}
        >
          <Badge colorScheme={"purple"} variant={"solid"} borderRadius={"full"} px={2}>
            Pexels Powered
          </Badge>
          <Text fontSize={"xs"} color={"whiteAlpha.800"}>
            Playing curated vertical HD reels. Add <Text as="span" fontWeight="bold" color="blue.300">VITE_PEXELS_API_KEY</Text> in .env.local for infinite dynamic reels.
          </Text>
          <CloseButton size={"sm"} color={"whiteAlpha.600"} onClick={() => setShowBanner(false)} />
        </Flex>
      )}

      {loading ? (
        <Flex justify={"center"} align={"center"} h={"full"}>
          <Spinner size={"xl"} color={"blue.500"} thickness={"4px"} />
        </Flex>
      ) : (
        <Box
          w={"full"}
          h={"100vh"}
          overflowY={"scroll"}
          scrollSnapType={"y mandatory"}
          css={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </Box>
      )}
    </Flex>
  );
};

export default ReelsPage;
