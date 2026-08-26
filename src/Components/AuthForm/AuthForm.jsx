import { Box, Button, Flex, Image, Input, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  })
  const handleAuth = () => {
    if(!inputs.email || !inputs.password){
      alert("Please fill all the fields")
      return
    }

    navigate("/")
  }

  return (
    <>
      <Box border={"1px solid gray"} borderRadius={4} padding={4}>
        <VStack spacing={4}>

          <Image src="/logo.png" h={24} cursor={"pointer"} alt="Instagram" />

          <Input placeholder="Email" fontSize={14} type="email" 
          value={inputs.email}
          onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
          />

          <Input placeholder="Password" fontSize={14} type="password" 
          value={inputs.password}
          onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
          />

          {!isLogin ? (<Input placeholder="Confirm Password"
          value={inputs.confirmPassword}
          onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
          fontSize={14} type="password" />) : null}

          <Button w={"full"} colorScheme={"blue"} size={"sm"} fontSize={14} onClick={handleAuth}>
            {isLogin ? "Login" : "Sign Up"}
          </Button>


          {/* ---------or--------- */}


          <Flex alignItems={"center"} justifyContent={"center"} my={4} gap={2} w={"full"}>
            <Box h={"1px"} bg={"gray.400"} flex={2} />
            <Text mx={1} color={"white"}>OR</Text>
            <Box h={"1px"} bg={"gray.400"} flex={2} />
          </Flex>

          <Flex alignItems={"center"} justifyContent={"center"} cursor={"pointer"}>
            <Image src="/google.png" w={"5"} alt="Google logo" />
            <Text mx={"2"} color={"blue.500"} fontSize={14}>
              Continue with Google
            </Text>
          </Flex>


        </VStack>
      </Box>

      <Box border={"1px solid gray"} borderRadius={4} padding={5} >
        <Flex alignItems={"center"} justifyContent={"center"}>
          <Box mx={2} fontSize={14}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Box>
          <Box onClick={() => setIsLogin(!isLogin)} color={"blue.500"} cursor={"pointer"}>
            {isLogin ? "Sign Up" : "Login"}
          </Box>
        </Flex>
      </Box>

    </>
  )
}

export default AuthForm