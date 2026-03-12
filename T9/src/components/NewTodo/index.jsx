import { useState } from "react";
import "./style.css";

function NewTodo({ onAddTodo }) {
    const [text, setText] = useState("");

    const handleSubmit = () => {
        if (text.trim() === "") {
            return;
        }

        onAddTodo(text.trim());
        setText("");
    };

    return (
        <div className="new-todo row">
            <input
                type="text"
                placeholder="Enter a new task"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button onClick={handleSubmit}>+</button>
        </div>
    );
}

export default NewTodo;
