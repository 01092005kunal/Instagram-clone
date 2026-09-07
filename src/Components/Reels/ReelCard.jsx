import {
  Avatar,
  Box,
  Flex,
  IconButton,
  Text,
  Button,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaComment, FaPlay } from "react-icons/fa";
import { FiVolume2, FiVolumeX, FiShare2, FiBookmark } from "react-icons/fi";
import { BsMusicNoteBeamed } from "react-icons/bs";
import { Link as RouterLink } from "react-router-dom";

const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const ReelCard = ({ reel }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(reel.isLiked || false);
  const [likesCount, setLikesCount] = useState(reel.likes || 124);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sync muted state directly to DOM element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.defaultMuted = isMuted;
    }
  }, [isMuted]);

  // Auto-play when reel is 50%+ in view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.muted = isMuted;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch((err) => {
                console.log("Autoplay waiting for interaction:", err.message);
                setIsPlaying(false);
              });
          }
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isMuted]);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.muted = isMuted;
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setShowPlayIcon(false);
        })
        .catch((err) => console.log("Play blocked:", err.message));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 1000);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleLikeToggle = (e) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  return (
    <Flex
      ref={containerRef}
      justify={"center"}
      align={"center"}
      w={"full"}
      h={"100vh"}
      scrollSnapAlign={"start"}
      py={4}
    >
      <Box
        position={"relative"}
        w={{ base: "100vw", sm: "400px" }}
        h={{ base: "100%", sm: "calc(100vh - 60px)" }}
        maxH={"800px"}
        borderRadius={{ base: 0, sm: "2xl" }}
        overflow={"hidden"}
        bg={"#111"}
        border={"1px solid"}
        borderColor={"whiteAlpha.200"}
        cursor={"pointer"}
        onClick={handleVideoClick}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.poster}
          loop
          playsInline
          muted={isMuted}
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            console.warn("Video failed to stream:", reel.videoUrl, e);
            setHasError(true);
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Big Tap to Play Overlay if paused and not playing */}
        {!isPlaying && !showPlayIcon && (
          <Flex
            position={"absolute"}
            top={"50%"}
            left={"50%"}
            transform={"translate(-50%, -50%)"}
            bg={"blackAlpha.600"}
            p={5}
            borderRadius={"full"}
            pointerEvents={"none"}
            backdropFilter={"blur(4px)"}
            zIndex={1}
          >
            <FaPlay size={28} color="white" />
          </Flex>
        )}

        {/* Center Play Icon Animation on Tap Pause */}
        {showPlayIcon && (
          <Flex
            position={"absolute"}
            top={"50%"}
            left={"50%"}
            transform={"translate(-50%, -50%)"}
            bg={"blackAlpha.700"}
            p={5}
            borderRadius={"full"}
            pointerEvents={"none"}
            zIndex={1}
          >
            <FaPlay size={32} color="white" />
          </Flex>
        )}

        {/* Mute/Unmute in Top Right */}
        <IconButton
          position={"absolute"}
          top={4}
          right={4}
          icon={isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
          aria-label="Toggle mute"
          size={"sm"}
          bg={"blackAlpha.600"}
          _hover={{ bg: "blackAlpha.800" }}
          borderRadius={"full"}
          color={"white"}
          onClick={toggleMute}
          zIndex={2}
        />

        {/* Right Side Action Bar */}
        <Flex
          position={"absolute"}
          right={3}
          bottom={16}
          direction={"column"}
          align={"center"}
          gap={5}
          zIndex={2}
        >
          {/* Like */}
          <Flex direction={"column"} align={"center"} onClick={handleLikeToggle}>
            <IconButton
              icon={
                isLiked ? (
                  <AiFillHeart size={28} color="#ff3040" />
                ) : (
                  <AiOutlineHeart size={28} color="white" />
                )
              }
              variant={"ghost"}
              aria-label="Like reel"
              _hover={{ bg: "transparent" }}
              p={0}
            />
            <Text fontSize={"xs"} fontWeight={"bold"} color={"white"}>
              {likesCount}
            </Text>
          </Flex>

          {/* Comment */}
          <Flex direction={"column"} align={"center"}>
            <IconButton
              icon={<FaComment size={24} color="white" />}
              variant={"ghost"}
              aria-label="Comments"
              _hover={{ bg: "transparent" }}
              p={0}
            />
            <Text fontSize={"xs"} fontWeight={"bold"} color={"white"}>
              {reel.comments || 18}
            </Text>
          </Flex>

          {/* Share */}
          <IconButton
            icon={<FiShare2 size={24} color="white" />}
            variant={"ghost"}
            aria-label="Share"
            _hover={{ bg: "transparent" }}
            p={0}
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard?.writeText(window.location.href);
              alert("Reel link copied to clipboard!");
            }}
          />

          {/* Bookmark */}
          <IconButton
            icon={<FiBookmark size={24} color={isSaved ? "white" : "white"} />}
            variant={"ghost"}
            aria-label="Bookmark"
            _hover={{ bg: "transparent" }}
            p={0}
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
          />

          {/* Spinning Music Vinyl Disc */}
          <Box
            w={"36px"}
            h={"36px"}
            borderRadius={"full"}
            bg={"linear-gradient(45deg, #111, #444)"}
            border={"2px solid white"}
            animation={`${spinAnimation} 4s linear infinite`}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            overflow={"hidden"}
          >
            <Avatar src={reel.avatar || "/profilepic.png"} size={"xs"} />
          </Box>
        </Flex>

        {/* Bottom Overlay: Creator info, caption, audio */}
        <Box
          position={"absolute"}
          bottom={0}
          left={0}
          right={0}
          p={4}
          bg={"linear-gradient(transparent, rgba(0,0,0,0.85))"}
          zIndex={2}
          pr={"70px"}
        >
          {/* Creator & Follow */}
          <Flex align={"center"} gap={3} mb={2}>
            <Avatar
              as={RouterLink}
              to={`/${reel.username}`}
              src={reel.avatar || "/profilepic.png"}
              name={reel.username}
              size={"sm"}
              onClick={(e) => e.stopPropagation()}
            />
            <Text
              as={RouterLink}
              to={`/${reel.username}`}
              fontSize={"sm"}
              fontWeight={"bold"}
              color={"white"}
              _hover={{ textDecoration: "underline" }}
              onClick={(e) => e.stopPropagation()}
            >
              {reel.username}
            </Text>
            <Button
              size={"xs"}
              variant={"outline"}
              color={"white"}
              borderColor={"whiteAlpha.600"}
              _hover={{ bg: "whiteAlpha.300" }}
              borderRadius={"md"}
              onClick={(e) => {
                e.stopPropagation();
                setIsFollowing(!isFollowing);
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </Flex>

          {/* Caption */}
          <Text fontSize={"sm"} color={"white"} mb={3} noOfLines={2}>
            {reel.caption}
          </Text>

          {/* Audio Bar */}
          <Flex align={"center"} gap={2}>
            <BsMusicNoteBeamed size={14} color="white" />
            <Text fontSize={"xs"} color={"whiteAlpha.900"} isTruncated>
              {reel.audioTitle || "Original Audio - " + reel.username}
            </Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

export default ReelCard;
