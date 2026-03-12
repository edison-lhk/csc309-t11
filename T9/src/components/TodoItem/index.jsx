import "./style.css";
import trashIcon from "./trash.webp";

function TodoItem({ todo, onDelete, onToggle }) {
    return (
        <div className="todo-item row">
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
            />

            <span className={todo.completed ? "completed" : ""}>
                {todo.text}
            </span>

            <a
                href="/#"
                onClick={(e) => {
                    e.preventDefault();
                    onDelete(todo.id);
                }}
            >
                <img src={trashIcon} alt="Delete todo" />
            </a>
        </div>
    );
}

export default TodoItem;