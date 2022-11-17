import { ChakraProvider } from "@chakra-ui/react";
import Navbar from "./Navbar";

export default function App() {
  return (
    <ChakraProvider>
      <Navbar />
    </ChakraProvider>
  );
}
