import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
};

const STORAGE_KEY = "tasks_storage";

export default function HomeScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadTasks();
    fetchTasksFromAPI();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setTasks(JSON.parse(data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // SAVE TASKS
  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasksToSave)
      );
    } catch (error) {
      console.log(error);
    }
  };
 const fetchTasksFromAPI = async () => {
  try {
    const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);

    if (savedTasks) {
      return;
    }

    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos?_limit=5"
    );

    const data = await response.json();

    const apiTasks: Task[] = data.map((item: any) => ({
      id: `api-${item.id}`,
      title: item.title,
      description: "Imported from API",
      completed: item.completed,
      createdAt: new Date().toLocaleDateString(),
    }));

    setTasks(apiTasks);
    saveTasks(apiTasks);
  } catch (error) {
    console.log(error);
  }
};

  
 const filteredTasks = tasks.filter((task) => {
  const matchesSearch = task.title
    .toLowerCase()
    .includes(search.toLowerCase());

  if (filter === "completed") {
    return matchesSearch && task.completed;
  }

  if (filter === "pending") {
    return matchesSearch && !task.completed;
  }

  return matchesSearch;
});

  const addTask = () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [...tasks, newTask];
    setTasks(updated);
    saveTasks(updated);

    setTitle("");
    setDescription("");
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((task) =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    );

    setTasks(updated);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const filtered = tasks.filter((task) => task.id !== id);
    setTasks(filtered);
    saveTasks(filtered);
  };

  return (
    <View style={styles.container}>
      
      
      <View style={styles.headerCard}>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>
          {tasks.length} tasks • {tasks.filter(t => t.completed).length} done
        </Text>
      </View>

      <TextInput
        placeholder="Search tasks..."
        placeholderTextColor="#999"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />
      <View
  style={{
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  }}
>
  <TouchableOpacity onPress={() => setFilter("all")}>
    <Text
      style={{
        fontWeight: filter === "all" ? "bold" : "normal",
      }}
    >
      All
    </Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => setFilter("completed")}>
    <Text
      style={{
        fontWeight:
          filter === "completed" ? "bold" : "normal",
      }}
    >
      Completed
    </Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => setFilter("pending")}>
    <Text
      style={{
        fontWeight:
          filter === "pending" ? "bold" : "normal",
      }}
    >
      Pending
    </Text>
  </TouchableOpacity>
</View>

      <View style={styles.formCard}>
        <TextInput
          placeholder="Task title"
          placeholderTextColor="#999"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Task description"
          placeholderTextColor="#999"
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={addTask}>
          <Text style={styles.buttonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {filteredTasks.length === 0 ? (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Text style={{ fontSize: 18 }}>📭 No tasks yet</Text>
          <Text style={{ color: "gray", marginTop: 5 }}>
            Add your first task to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/task/[id]",
                  params: {
                    title: item.title,
                    description: item.description,
                    createdAt: item.createdAt,
                    completed: item.completed.toString(),
                  },
                })
              }
              style={[
                styles.taskCard,
                item.completed && styles.completedCard,
              ]}
            >
              <Text style={styles.taskTitle}>
                {item.title} {item.completed ? "✅" : "❌"}
              </Text>

              <Text style={{ color: item.completed ? "green" : "orange" }}>
                {item.completed ? "Completed" : "Pending"}
              </Text>

              <Text style={{ marginTop: 5 }}>
                {item.description}
              </Text>

              <Text style={{ marginTop: 5, color: "gray" }}>
                {item.createdAt}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleTask(item.id)}>
                  <Text style={{ color: "#007AFF" }}>
                    {item.completed ? "Undo" : "Done"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Text style={{ color: "red" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F8FA",
  },

  headerCard: {
    marginTop: 50,
    marginBottom: 15,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
  },

  subtitle: {
    color: "gray",
    marginTop: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  textArea: {
    height: 80,
  },

  formCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  taskCard: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },

  completedCard: {
    borderLeftColor: "#22c55e",
    backgroundColor: "#f0fff4",
  },

  taskTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});