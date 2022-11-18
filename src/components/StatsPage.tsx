import { useLiveQuery } from "dexie-react-hooks";
import _ from "lodash";
import { db } from "../lib/db";

export default function StatsPage() {
  const results = useLiveQuery(() => db.playedChords.toArray());
  // TODO: try dexie to do DB query
  const groupedResults = _.groupBy(results, (r) => r.name);
  const sortedKeys = Object.keys(groupedResults).sort();
  // const worstFive =

  return (
    <ul>
      {_.map(sortedKeys, (key) => {
        const results = groupedResults[key];
        return (
          <li key={key}>
            {key}, attempts: {results.length}, avg time to success:{" "}
            {_.sum(_.map(results, (r) => r.timeToSuccess)) / results.length}
          </li>
        );
      })}
    </ul>
  );
}
