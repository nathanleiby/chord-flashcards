import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spacer,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import {
  HashRouter as Router,
  Link as ReactRouterLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import ExplorePage from "./ExplorePage";
import GamePage from "./GamePage";
import HomePage from "./HomePage";
import openHands from "./open-hands.jpg";
import StatsPage from "./StatsPage";
import VoicingsPage from "./VoicingsPage";
const Links = ["game", "stats", "explore", "voicings", "about"];

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    as={ReactRouterLink}
    to={`/${children}`}
  >
    {children}
  </Link>
);

const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={"center"}>
          <Box>
            <ReactRouterLink to={"/home"}>
              <HStack>
                <Image
                  src={openHands}
                  alt={"Jazz Hands logo"}
                  boxSize={"10"}
                  borderRadius="lg"
                />
                <Text fontSize={"x-large"} fontWeight={"bold"}>
                  Jazz Hands
                </Text>
              </HStack>
            </ReactRouterLink>
          </Box>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={"center"}>
          <Menu>
            <MenuButton
              as={Button}
              rounded={"full"}
              variant={"link"}
              cursor={"pointer"}
              minW={0}
            >
              <Avatar
                size={"sm"}
                src={
                  "https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                }
              />
            </MenuButton>
            <MenuList>
              <MenuItem>Link 1</MenuItem>
              <MenuItem>Link 2</MenuItem>
              <MenuDivider />
              <MenuItem>Link 3</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default function BasePage() {
  return (
    <>
      <Router>
        <NavBar />
        <Spacer height={"4"} />
        <Container maxWidth={"container.xl"} padding={0}>
          <Routes>
            <Route path={`/game`} element={<GamePage />} />
            <Route path={`/stats`} element={<StatsPage />} />
            <Route path={`/about`} element={<>About Page</>} />
            <Route path={`/explore`} element={<ExplorePage />} />
            <Route path={`/voicings`} element={<VoicingsPage />} />
            {/* TODO: Don't show header? */}
            <Route path={`/home`} element={<HomePage />} />
            <Route path="*" element={<Navigate to={`/game`} replace />} />
          </Routes>
        </Container>
      </Router>
    </>
  );
}
