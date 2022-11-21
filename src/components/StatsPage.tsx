import { ViewIcon } from "@chakra-ui/icons";
import {
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBoolean,
} from "@chakra-ui/react";
import { useLiveQuery } from "dexie-react-hooks";
import _ from "lodash";
import { useState } from "react";
import { db } from "../lib/db";

enum tableSort {
  ByChord = "by-chord",
  Best = "best",
  Worst = "worst",
}

export default function StatsPage() {
  const results = useLiveQuery(() => db.playedChords.toArray());
  // TODO: try dexie to do DB query
  const groupedResults = _.groupBy(results, (r) => r.name);

  const [tableSortDirection, setTableSortDirection] = useState(
    tableSort.ByChord
  );
  const [memoryMode, setMemoryMode] = useBoolean(false);

  const stats = _.mapValues(groupedResults, (results, key) => {
    let filteredResults = _.filter(
      results,
      (x) => x.timeToSuccess <= 30 // remove outliers
    );
    if (memoryMode) {
      filteredResults = _.filter(filteredResults, (r) => r.memoryMode);
    }

    return {
      key,
      avgTimeToSuccess:
        _.sum(_.map(filteredResults, (r) => r.timeToSuccess)) /
        filteredResults.length,
      attempts: filteredResults.length,
    };
  });

  // sort by
  let sortedStats;
  switch (tableSortDirection) {
    case tableSort.ByChord:
      sortedStats = _.sortBy(stats, (s, key) => key);
      break;
    case tableSort.Best:
      sortedStats = _.sortBy(stats, (s, key) => s.avgTimeToSuccess);
      break;
    case tableSort.Worst:
      sortedStats = _.sortBy(stats, (s, key) => -1 * s.avgTimeToSuccess);
      break;
  }

  // consider using react-table for built-in sorting support
  // https://chakra-ui.com/getting-started/with-react-table
  return (
    <>
      <HStack>
        <FormLabel>Sort By</FormLabel>
        <RadioGroup
          onChange={(v) => setTableSortDirection(v as tableSort)}
          value={tableSortDirection}
        >
          <Stack direction="row">
            <Radio value={tableSort.ByChord}>Chord</Radio>
            <Radio value={tableSort.Best}>Best</Radio>
            <Radio value={tableSort.Worst}>Worst</Radio>
          </Stack>
        </RadioGroup>
      </HStack>
      <HStack>
        <FormLabel>
          Only memory mode <ViewIcon />
        </FormLabel>
        <Switch
          isChecked={memoryMode}
          onChange={(v) => setMemoryMode.toggle()}
        />
      </HStack>

      <Spacer height={4} />
      <TableContainer>
        <Table colorScheme="teal">
          <Thead>
            <Tr>
              <Th>Chord</Th>
              <Th>Attempts</Th>
              <Th isNumeric>Average Time to Success</Th>
            </Tr>
          </Thead>
          <Tbody>
            {_.map(sortedStats, ({ key, attempts, avgTimeToSuccess }) => {
              return (
                <Tr key={key}>
                  <Td>{key}</Td>
                  <Td isNumeric>{attempts}</Td>
                  <Td isNumeric>{Math.round(avgTimeToSuccess * 10) / 10}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}
