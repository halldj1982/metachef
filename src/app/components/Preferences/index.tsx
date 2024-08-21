// Preferences.tsx

import React, { ChangeEvent } from "react";

interface PreferencesProps {
  nationality: string;
  setNationality: (value: string) => void;
  protein: string;
  setProtein: (value: string) => void;
  cookingMethod: string;
  setCookingMethod: (value: string) => void;
  dietConsiderations: string[];
  setDietConsiderations: (values: string[]) => void;
  flavors: { [key: string]: number };
  setFlavors: (flavor: string, value: number) => void;
  showFlavorSliders: boolean;
  setShowFlavorSliders: (value: boolean) => void;
}

const Preferences: React.FC<PreferencesProps> = ({
  nationality,
  setNationality,
  protein,
  setProtein,
  cookingMethod,
  setCookingMethod,
  dietConsiderations,
  setDietConsiderations,
  flavors,
  setFlavors,
  showFlavorSliders,
  setShowFlavorSliders,
}) => {
  
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setDietConsiderations([...dietConsiderations, value]);
    } else {
      setDietConsiderations(dietConsiderations.filter((item) => item !== value));
    }
  };

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>, flavor: string) => {
    setFlavors(flavor, parseInt(event.target.value, 10));
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-white font-bold mb-2" htmlFor="nationality">
          Nationality
        </label>
        <select
          id="nationality"
          className="w-full p-2 bg-gray-800 text-white rounded"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
        >
          <option value="Any">Any</option>
          <option value="American">American</option>
          <option value="Italian">Italian</option>
          <option value="Chinese">Chinese</option>
          <option value="Indian">Indian</option>
        </select>
      </div>

      <div>
        <label className="block text-white font-bold mb-2" htmlFor="protein">
          Protein
        </label>
        <select
          id="protein"
          className="w-full p-2 bg-gray-800 text-white rounded"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
        >
          <option value="Any">Any</option>
          <option value="Chicken">Chicken</option>
          <option value="Beef">Beef</option>
          <option value="Fish">Fish</option>
          <option value="Vegetarian">Vegetarian</option>
        </select>
        {(protein === "Other") && (
          <input
            type="text"
            className="mt-2 w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Enter nationality"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
        )}
      </div>

      <div>
        <label className="block text-white font-bold mb-2" htmlFor="cookingMethod">
          Cooking Method
        </label>
        <select
          id="cookingMethod"
          className="w-full p-2 bg-gray-800 text-white rounded"
          value={cookingMethod}
          onChange={(e) => setCookingMethod(e.target.value)}
        >
          <option value="Any">Any</option>
          <option value="Grilling">Grilling</option>
          <option value="Baking">Baking</option>
          <option value="Frying">Frying</option>
          <option value="Steaming">Steaming</option>
        </select>
      </div>

      <div>
        <label className="block text-white font-bold mb-2">Dietary Considerations</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                value="Vegan"
                checked={dietConsiderations.includes("Vegan")}
                onChange={handleCheckboxChange}
              />
              <span className="ml-2 text-white">Vegan</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                value="Gluten-Free"
                checked={dietConsiderations.includes("Gluten-Free")}
                onChange={handleCheckboxChange}
              />
              <span className="ml-2 text-white">Gluten-Free</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                value="Keto"
                checked={dietConsiderations.includes("Keto")}
                onChange={handleCheckboxChange}
              />
              <span className="ml-2 text-white">Keto</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                value="Low-Carb"
                checked={dietConsiderations.includes("Low-Carb")}
                onChange={handleCheckboxChange}
              />
              <span className="ml-2 text-white">Low-Carb</span>
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={showFlavorSliders}
            onChange={(e) => setShowFlavorSliders(e.target.checked)}
          />
          <span className="ml-2 text-white">Customize Flavor Profile</span>
        </label>
      </div>

      {showFlavorSliders && (
        <div className="space-y-4">
          {["Sweet", "Salty", "Sour", "Bitter", "Spice Level"].map((flavor) => (
            <div key={flavor}>
              <label className="block text-white font-bold mb-2" htmlFor={flavor.toLowerCase()}>
                {flavor}
              </label>
              <input
                id={flavor.toLowerCase()}
                type="range"
                min="1"
                max="5"
                value={flavors[flavor.toLowerCase()]}
                onChange={(e) => handleSliderChange(e, flavor.toLowerCase())}
                className="w-full"
              />
              <div className="flex justify-between text-white">
                <span>1</span>
                <span>5</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Preferences;
