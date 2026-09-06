import { Box, Flex, Link, Tooltip, Avatar, useDisclosure } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { CreatePostLogo, InstagramLogo, InstagramMobileLogo, NotificationsLogo, SearchLogo } from "../../assets/constants"
import { AiFillHome } from "react-icons/ai"
import { BiLogOut } from "react-icons/bi"
import { useAuth } from "../../context/AuthContext"
import CreatePostModal from "./CreatePostModal"

const Sidebar = () => {
  const { signOut, userProfile } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const sidebarItems = [
    {
      icon: <AiFillHome size={25} />,
      text: "Home",
      link: "/"
    },
    {
      icon: <SearchLogo />,
      text: "Search",
      link: null
    },
    {
      icon: <NotificationsLogo />,
      text: "Notifications",
      link: null
    },
    {
      icon: <CreatePostLogo />,
      text: "Create",
      action: onOpen,
    },
    {
      icon: <Avatar size={"sm"} name={userProfile?.full_name || userProfile?.username || "User"} src={userProfile?.profile_pic_url || "/profilepic.png"} />,
      text: "Profile",
      link: userProfile?.username ? `/${userProfile.username}` : "/asaprogrammer",
    },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error("Logout error:", err.message)
    }
  }

  return (
    <Box
      height="100vh"
      borderRight="1px solid"
      borderColor="whiteAlpha.300"
      py={8}
      position="sticky"
      top={0}
      left={0}
      px={{ base: 2, md: 4 }}
    >
      <Flex direction="column" gap={10} w="full" height="full">
        <Link
          as={RouterLink}
          to="/"
          pl={2}
          display={{ base: "none", md: "block" }}
          cursor="pointer"
        >
          <InstagramLogo />
        </Link>

        <Link
          as={RouterLink}
          to="/"
          pl={2}
          display={{ base: "block", md: "none" }}
          borderRadius={6}
          _hover={{ bg: "whiteAlpha.200" }}
          w={10}
          cursor="pointer"
        >
          <InstagramMobileLogo />
        </Link>

        <Flex direction="column" gap={5} cursor="pointer">
          {sidebarItems.map((item, index) => (
            <Tooltip
              key={index}
              label={item.text}
              placement="right"
              ml={1}
              openDelay={500}
              display={{ base: "block", md: "none" }}
            >
              {item.link ? (
                <Link
                  as={RouterLink}
                  to={item.link}
                  display="flex"
                  alignItems="center"
                  gap={4}
                  _hover={{ bg: "whiteAlpha.200" }}
                  borderRadius={6}
                  p={2}
                  w={{ base: 10, md: "full" }}
                  justifyContent={{ base: "center", md: "flex-start" }}
                  cursor="pointer"
                >
                  {item.icon}
                  <Box display={{ base: "none", md: "block" }}>
                    {item.text}
                  </Box>
                </Link>
              ) : (
                <Flex
                  onClick={item.action}
                  display="flex"
                  alignItems="center"
                  gap={4}
                  _hover={{ bg: "whiteAlpha.200" }}
                  borderRadius={6}
                  p={2}
                  w={{ base: 10, md: "full" }}
                  justifyContent={{ base: "center", md: "flex-start" }}
                  cursor="pointer"
                >
                  {item.icon}
                  <Box display={{ base: "none", md: "block" }}>
                    {item.text}
                  </Box>
                </Flex>
              )}
            </Tooltip>
          ))}
        </Flex>

        {/* LOGOUT BUTTON */}
        <Tooltip 
          label="Logout"
          placement="right"
          ml={1}
          openDelay={500}
          display={{ base: "block", md: "none" }}
        >
          <Flex
            onClick={handleLogout}
            display="flex"
            alignItems="center"
            gap={4}
            _hover={{ bg: "whiteAlpha.200" }}
            borderRadius={6}
            p={2}
            w={{ base: 10, md: "full" }}
            justifyContent={{ base: "center", md: "flex-start" }}
            cursor="pointer"
            mt="auto"
          >
            <BiLogOut size={25} />
            <Box display={{ base: "none", md: "block" }}>Logout</Box>
          </Flex>
        </Tooltip>
      </Flex>

      {/* CREATE POST MODAL */}
      <CreatePostModal isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}

export default Sidebar