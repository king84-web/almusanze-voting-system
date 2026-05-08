import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 40,
    backgroundColor: "#ffffff",
    color: "#1a2744",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
  },
  label: {
    color: "#c9a84c",
    fontSize: 12,
    marginBottom: 2,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  candidate: {
    marginTop: 12,
    padding: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
  },
  winner: {
    backgroundColor: "#f8edd0",
  },
});

interface CandidateResult {
  name: string;
  team: string;
  position: string;
  votes: number;
  percentage: number;
  winner: boolean;
}

interface ResultsPdfProps {
  electionName: string;
  electionDate: string;
  turnout: number;
  results: CandidateResult[];
}

export default function ResultsPdf({ electionName, electionDate, turnout, results }: ResultsPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>ALM Election Results</Text>
          <Text style={styles.label}>{electionName}</Text>
          <Text>Election date: {electionDate}</Text>
          <Text>Turnout: {turnout}%</Text>
        </View>
        {results.map((item) => (
          <View key={`${item.name}-${item.position}`} style={[styles.candidate, item.winner ? styles.winner : {}]}>
            <View style={styles.row}>
              <Text style={{ fontWeight: 700 }}>{item.name}</Text>
              <Text>{item.votes} votes</Text>
            </View>
            <Text>{item.position} • {item.team}</Text>
            <Text>{item.percentage}% of total</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
