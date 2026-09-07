import { Alert, AlertIcon, Box, Button, Flex, Image, Input, InputGroup, InputRightElement, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiEye, FiEyeOff } from 'react-icons/fi'

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [inputs, setInputs] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: ''
  })

  const handleAuth = async () => {
    setError('')

    if (!inputs.email || !inputs.password) {
      setError('Please fill in all required fields.')
      return
    }

    if (!isLogin) {
      if (!inputs.username) {
        setError('Please enter a username.')
        return
      }
      if (inputs.password !== inputs.confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setLoading(true)
    try {
      if (isLogin) {
        // --- 1. CALL SIGN IN HERE ---
        await signIn(inputs.email, inputs.password)
      } else {
        // --- 2. CALL SIGN UP HERE ---
        await signUp(inputs.email, inputs.password, inputs.username, inputs.fullName)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Box border={'1px solid gray'} borderRadius={4} padding={4}>
        <VStack spacing={4}>
          <Image src="/logo.png" h={24} cursor={'pointer'} alt="Instagram" />

          <Input
            placeholder="Email"
            fontSize={14}
            type="email"
            value={inputs.email}
            onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
          />

          {!isLogin && (
            <>
              <Input
                placeholder="Username"
                fontSize={14}
                type="text"
                value={inputs.username}
                onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
              />
              <Input
                placeholder="Full Name"
                fontSize={14}
                type="text"
                value={inputs.fullName}
                onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
              />
            </>
          )}

          <InputGroup size="md">
            <Input
              placeholder="Password"
              fontSize={14}
              type={showPassword ? "text" : "password"}
              value={inputs.password}
              onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
            />
            <InputRightElement h={"full"}>
              <Button
                variant={"ghost"}
                size={"sm"}
                onClick={() => setShowPassword((prev) => !prev)}
                _hover={{ bg: "transparent" }}
                color={"gray.400"}
                p={0}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </Button>
            </InputRightElement>
          </InputGroup>

          {!isLogin && (
            <InputGroup size="md">
              <Input
                placeholder="Confirm Password"
                value={inputs.confirmPassword}
                onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
                fontSize={14}
                type={showConfirmPassword ? "text" : "password"}
              />
              <InputRightElement h={"full"}>
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  _hover={{ bg: "transparent" }}
                  color={"gray.400"}
                  p={0}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </Button>
              </InputRightElement>
            </InputGroup>
          )}

          {error && (
            <Alert status="error" fontSize={13} p={2} borderRadius={4}>
              <AlertIcon fontSize={12} />
              {error}
            </Alert>
          )}

          <Button
            w={'full'}
            colorScheme={'blue'}
            size={'sm'}
            fontSize={14}
            isLoading={loading}
            onClick={handleAuth}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>

          {/* ---------or--------- */}

          <Flex alignItems={'center'} justifyContent={'center'} my={4} gap={2} w={'full'}>
            <Box h={'1px'} bg={'gray.400'} flex={2} />
            <Text mx={1} color={'white'}>
              OR
            </Text>
            <Box h={'1px'} bg={'gray.400'} flex={2} />
          </Flex>

          <Flex alignItems={'center'} justifyContent={'center'} cursor={'pointer'}>
            <Image src="/google.png" w={'5'} alt="Google logo" />
            <Text mx={'2'} color={'blue.500'} fontSize={14}>
              Continue with Google
            </Text>
          </Flex>
        </VStack>
      </Box>

      <Box border={'1px solid gray'} borderRadius={4} padding={5}>
        <Flex alignItems={'center'} justifyContent={'center'}>
          <Box mx={2} fontSize={14}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </Box>
          <Box
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            color={'blue.500'}
            cursor={'pointer'}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </Box>
        </Flex>
      </Box>
    </>
  )
}

export default AuthForm