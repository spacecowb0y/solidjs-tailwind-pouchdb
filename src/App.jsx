import { createSignal, onCleanup, createEffect } from "solid-js";
import PouchDB from "pouchdb-browser";
import { For } from "solid-js/web";

const App = () => {
  const [todos, setTodos] = createSignal([]);
  const [newTodo, setNewTodo] = createSignal("");

  const db = new PouchDB("todos");

  const fetchTodos = async () => {
    try {
      const { rows } = await db.allDocs({
        include_docs: true,
        descending: false,
      });
      const data = rows.map((row) => row.doc);
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    try {
      const todo = {
        _id: new Date().toJSON(),
        title: newTodo(),
        completed: false,
      };
      const response = await db.post(todo);
      console.log("response:", response);
      const data = await db.get(response.id);
      setTodos((prevTodos) => [...prevTodos, data]);
      setNewTodo("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const updateTodoStatus = async (todoId, completed) => {
    try {
      const todo = await db.get(todoId);
      todo.completed = completed;
      await db.put(todo);
      const updatedTodo = await db.get(todoId);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === updatedTodo._id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };

  onCleanup(() => {
    db.close();
  });

  createEffect(() => {
    fetchTodos();
  });

  return (
    <div class="flex items-center justify-center w-screen h-screen font-medium">
      <div class="flex flex-grow items-center justify-center h-full text-gray-600 bg-gray-100">
        <div class="max-w-full p-8 bg-white rounded-lg shadow-lg w-96">
          <div class="flex items-center mb-6">
            <svg
              class="h-8 w-8 text-indigo-500 stroke-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h4 class="font-semibold ml-3 text-lg">My ToDo List</h4>
          </div>

          <For each={todos()}>
            {(todo) => (
              <div key={todo._id}>
                <input
                  class="hidden"
                  type="checkbox"
                  id={todo._id}
                  onChange={(e) => updateTodoStatus(todo._id, e.target.checked)}
                  checked={todo.completed}
                />
                <label
                  class="flex items-center h-10 px-2 rounded cursor-pointer hover:bg-gray-100"
                  for={todo._id}
                >
                  <span class="flex items-center justify-center w-5 h-5 text-transparent border-2 border-gray-300 rounded-full">
                    <svg
                      class="w-4 h-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                  <span class="ml-4 text-sm">{todo.title}</span>
                </label>
              </div>
            )}
          </For>

          <form
            class="flex items-center w-full h-8 px-2 mt-2 text-sm font-medium rounded"
            onSubmit={addTodo}
          >
            <svg
              class="w-5 h-5 text-gray-400 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <input
              class="flex-grow h-8 ml-4 bg-transparent focus:outline-none font-medium"
              type="text"
              placeholder="add a new task"
              value={newTodo()}
              onInput={(e) => setNewTodo(e.target.value)}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
