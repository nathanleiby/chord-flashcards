import { ChakraProvider } from "@chakra-ui/react";
import BasePage from "./BasePage";

export default function App() {
  return (
    <ChakraProvider>
      <BasePage />
    </ChakraProvider>
  );
}
