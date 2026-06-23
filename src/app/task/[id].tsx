import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function TaskDetail() {
  const {
    title,
    description,
    createdAt,
    completed,
  } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>

        <Text
          style={[
            styles.status,
            {
              color:
                completed === "true"
                  ? "#22c55e"
                  : "#f59e0b",
            },
          ]}
        >
          {completed === "true"
            ? "✅ Completed"
            : "⏳ Pending"}
        </Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.description}>
          {description}
        </Text>

        <Text style={styles.label}>Created Date</Text>
        <Text style={styles.date}>
          {createdAt}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 20,
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  status: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },

  label: {
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
  },

  description: {
    color: "#444",
    lineHeight: 22,
  },

  date: {
    color: "gray",
  },
});