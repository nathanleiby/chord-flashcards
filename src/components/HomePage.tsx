import {
  Button,
  Center,
  Container,
  Flex,
  Heading,
  IconProps,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";

import heroImage from "./hero.png";

export default function CallToActionWithIllustration() {
  return (
    <Container maxW={"5xl"}>
      <Stack
        textAlign={"center"}
        align={"center"}
        spacing={{ base: 8, md: 8 }}
        py={{ base: 20, md: 4 }}
      >
        <Heading
          fontWeight={600}
          fontSize={{ base: "3xl", sm: "4xl", md: "6xl" }}
          lineHeight={"110%"}
        >
          Jazz Hands{" "}
          <Text as={"span"} color={"orange.400"}>
            made easy
          </Text>
        </Heading>
        <Text color={"gray.500"} maxW={"3xl"}>
          Sight read fake books with ease. Jam with your friends. Stank face
          when you discover a dreamy voicing.
        </Text>
        <Stack spacing={6} direction={"row"}>
          <Button
            rounded={"full"}
            px={6}
            colorScheme={"orange"}
            bg={"orange.400"}
            _hover={{ bg: "orange.500" }}
          >
            Get started
          </Button>
          <Button rounded={"full"} px={6}>
            Learn more
          </Button>
        </Stack>
        <Flex w={"full"}>
          <Illustration
            height={{ sm: "24rem", lg: "28rem" }}
            mt={{ base: 12, sm: 16 }}
          />
        </Flex>
      </Stack>
    </Container>
  );
}

export const Illustration = (props: IconProps) => {
  return (
    <Center>
      <Image src={heroImage} width={"50%"} />;
    </Center>
  );
};
