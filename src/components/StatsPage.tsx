import {
  Box,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
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

  const sortedKeys = Object.keys(groupedResults).sort();

  // const worstFive = _.sortBy(groupedResults, r => )
  const stats = _.mapValues(groupedResults, (results, key) => {
    return {
      key,
      avgTimeToSuccess:
        _.sum(
          _.filter(
            _.map(results, (r) => r.timeToSuccess),
            (x) => x <= 30 // remove outliers
          )
        ) / results.length,
      attempts: results.length,
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
      <Box>
        <RadioGroup
          onChange={(v) => setTableSortDirection(v as tableSort)}
          value={tableSortDirection}
        >
          <Stack direction="row">
            <Radio value={tableSort.ByChord}>By Chord</Radio>
            <Radio value={tableSort.Best}>Best</Radio>
            <Radio value={tableSort.Worst}>Worst</Radio>
          </Stack>
        </RadioGroup>
      </Box>
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
                <Tr>
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
