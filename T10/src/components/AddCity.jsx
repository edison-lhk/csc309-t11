import './AddCity.css';
import { forwardRef, useState } from "react";
import { useCities } from "../contexts/CitiesContext";

const AddCity = forwardRef(({ setError }, ref) => {
    const [cityName, setCityName] = useState("");
    const { addCity } = useCities();

    const handle_submit = async (e) => {
        e.preventDefault();

        const trimmedName = cityName.trim();

        if (!trimmedName) {
            setError("City name cannot be blank.");
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmedName)}&limit=1`,
                {
                    headers: {
                        "User-Agent": "ACoolWeatherApp/0.1 (your_email)"
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch city coordinates.");
            }

            const data = await response.json();

            if (!data.length) {
                setError(`City '${trimmedName}' is not found.`);
                return;
            }

            const result = data[0];

            addCity({
                name: trimmedName,
                latitude: Number(result.lat),
                longitude: Number(result.lon),
            });

            setCityName("");
            ref.current?.close();
        } catch (err) {
            setError(err.message || "Something went wrong.");
        }
    };

    return (
        <dialog ref={ref}>
            <div className="dialog-header">
                <span>Add A City</span>
                <a onClick={() => ref.current?.close()}>✖</a>
            </div>

            <form onSubmit={handle_submit}>
                <input
                    type="text"
                    placeholder="Enter City Name"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    required
                />
                
                <div className="button-group">
                    <button type="submit">Add</button>
                    <button type="button" onClick={() => ref.current?.close()}>
                        Close
                    </button>
                </div>
            </form>
        </dialog>
    );
});

export default AddCity;
