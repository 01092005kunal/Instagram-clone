import { Box, Flex } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'

// instead of adding the sidebar to each and every page or a component itself , we can add it only once to the page layoout component and wrap it with the children with it . This way , we can have a Sdebar on every page except the AuthPage As per the conditioon passed...

const PageLayouts = ({children}) => {
    const {pathname} = useLocation()
  return (
    <Flex>
        {/* sidebar on the left */}
        {pathname !== '/auth' ? (
       <Box w={{ base: "70px", md: "240px" }}>
            <Sidebar />
        </Box>
        ) : null} 
        {/* the page content on the right */}
            <Box flex={1} w={{ base: "calc(100% - 70px)", md: "calc(100% - 240px)" }}>
                {children}
            </Box>   
    </Flex>
  )
}

export default PageLayouts