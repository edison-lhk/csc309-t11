import './City.css';
import { useEffect, useState } from 'react';
import { useCities } from '../contexts/CitiesContext';
import { useNavigate } from 'react-router-dom';

const City = ({ city }) => {
    const [temperature, setTemperature] = useState(null);
    const { removeCity } = useCities();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemperature = async () => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current_weather=true`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch temperature.");
                }

                const data = await response.json();
                setTemperature(data.current_weather?.temperature ?? null);
            } catch (err) {
                setTemperature(null);
            }
        };

        fetchTemperature();
    }, [city.latitude, city.longitude]);

    const handle_click = () => {
        navigate(`/${city.id}`);
    };

    const handle_remove = (e) => {
        e.stopPropagation();
        removeCity(city.id);
    };

    return (
        <div className="city-card">
            <button className="remove-btn" onClick={handle_remove}>×</button>
            <div className="city-content" onClick={handle_click}>
                <h2>{city.name}</h2>
                {temperature !== null ? (
                    <p className="temperature">{temperature}°C</p>
                ) : (
                    <div className="spinner"></div>
                )}
            </div>
        </div>
    );
};

export default City;