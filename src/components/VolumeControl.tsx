import {
  Button,
  Flex,
  FormLabel,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react";
import { faVolumeMute, faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export interface VolumeControlProps {
  onVolumeChange: Function;
}

const VolumeControl = (props: VolumeControlProps) => {
  const [gainValue, setGainValue] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const { onVolumeChange } = props;

  useEffect(() => {
    const normalizedGain = gainValue / 100; // scale to [0,1]
    const effectiveGain = isMuted ? 0 : normalizedGain;
    onVolumeChange(effectiveGain);
  }, [isMuted, gainValue]);

  return (
    <Flex flexDirection="column">
      <FormLabel>Volume:</FormLabel>
      <Slider
        aria-label="slider-ex-4"
        defaultValue={gainValue}
        min={0}
        max={100}
        colorScheme="teal"
        onChange={(v) => setGainValue(v)}
      >
        <SliderTrack bg="red.100">
          <SliderFilledTrack bg="tomato" />
        </SliderTrack>
        <SliderThumb boxSize={6} />
      </Slider>
      <Button
        colorScheme="teal"
        size="md"
        onClick={() => {
          setIsMuted(!isMuted);
        }}
      >
        {isMuted ? (
          <>
            <FontAwesomeIcon icon={faVolumeUp} />
            <Text>Unmute</Text>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faVolumeMute} />
            <Text>Mute</Text>
          </>
        )}
      </Button>
    </Flex>
  );
};

export default VolumeControl;
