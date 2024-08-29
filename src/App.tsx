import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

interface ITodo {
  id: number;
  title: string;
  isCompleted: boolean;
}

const App = () => {
  const [todo, setTodo] = useState<ITodo[]>([]);
  const { register, handleSubmit, reset } = useForm();
  const [currentTodo, setCurrentTodo] = useState({} as ITodo);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`http://localhost:3000/todo`);
        const data = await response.json();
        if (response.status !== 200) throw new Error(data.message);
        setTodo(data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const onHandleRemove = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/todo/${id}`, {
        method: "DELETE",
      });
      if (response.status !== 200) return alert("xóa nhiệm vụ thất bại !");
      alert("xóa nhiệm vụ thành công.");
      //re-render
      setTodo(todo.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const onHandleSubmit = async (data: any) => {
    try {
      const response = await fetch(`http://localhost:3000/todo/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isCompleted: false }),
      });

      const result = await response.json();
      if (response.status !== 201) return alert("thêm nhiệm vụ thất bại !");
      alert("thêm nhiệm vụ thành công !");
      reset();
      setTodo([result, ...todo]);
    } catch (error) {
      console.error(error);
    }
    console.log(data);
  };

  const onHandleSave = async (data: any) => {
    console.log("data-form", data);
    console.log("current", currentTodo);
    console.log({ ...currentTodo, title: data["title-update"] });
    try {
      const response = await fetch(
        `http://localhost:3000/todo/${currentTodo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...currentTodo, title: data["title-update"] }),
        }
      );
      const result = await response.json();
      if (response.status !== 200) return alert("Cập nhật thất bại !");
      alert("cập nhập thành công !");

      setTodo(todo.map((todo) => (todo.id === result.id ? result : todo)));
      setCurrentTodo({} as ITodo);
    } catch (error) {}
  };

  const onToggleChecked = async (item: any) => {
    try {
      const response = await fetch(`http://localhost:3000/todo/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({...item, isCompleted: !item.isCompleted}),
      })
      const result = await response.json();
      setTodo(todo.map((todo) => (todo.id === result.id ? result : todo)));
    } catch (error) {
      console.error(error);
      
    }
  }

  return (
    <div>
      <h1>Todo App</h1>
      <form onSubmit={handleSubmit(onHandleSubmit)}>
        <input type="text" {...register("title")} />
        <button>Add</button>
      </form>

      <ul>
        {todo.map((item: ITodo) => (
          <li key={item.id}>
            <input
              type="checkbox"
              checked={item.isCompleted}
              onChange={() => onToggleChecked(item)}
              // readOnly
            />
            {currentTodo.id === item.id ? (
              <form action="" onSubmit={handleSubmit(onHandleSave)}>
                <input type="text" {...register("title-update")} />
                <button>Save</button>
                <button onClick={() => setCurrentTodo({} as ITodo)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span
                  onClick={() => {
                    reset({ "title-update": item.title });
                    setCurrentTodo(item);
                  }}
                  style={
                    item.isCompleted ? { textDecoration: "line-through" } : {}
                  }
                >
                  {item.title}
                </span>
                <button onClick={() => onHandleRemove(item.id)}>Xóa</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
