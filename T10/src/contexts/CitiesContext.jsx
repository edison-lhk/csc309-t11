import { createContext, useContext, useState } from "react";

const CitiesContext = createContext();

export const CitiesProvider = ({ children }) => {
    const [cities, setCities] = useState([
        { id: 1, name: "Toronto", latitude: 43.70011, longitude: -79.4163 }
    ]);

    const addCity = ({ name, latitude, longitude }) => {
        setCities((prevCities) => {
            const maxId = prevCities.length
                ? Math.max(...prevCities.map((city) => city.id))
                : 0;

            return [
                ...prevCities,
                {
                    id: maxId + 1,
                    name,
                    latitude,
                    longitude,
                }
            ];
        });
    };

    const removeCity = (cityId) => {
        setCities((prevCities) =>
            prevCities.filter((city) => city.id !== cityId)
        );
    };

    return (
        <CitiesContext.Provider value={{ cities, addCity, removeCity }}>
            {children}
        </CitiesContext.Provider>
    );
};

export const useCities = () => {
    return useContext(CitiesContext);
};
