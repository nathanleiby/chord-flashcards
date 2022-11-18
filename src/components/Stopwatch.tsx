import { Button, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsed((elapsed) => elapsed + 1);
      }, 1000);
    } else {
      clearInterval(interval!);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div>
      <Text fontSize="4xl">{elapsed}</Text>
      <Button onClick={() => setIsActive(!isActive)}>
        {isActive ? "Stop" : "Start"}
      </Button>
    </div>
  );
}
