import React, { useState } from 'react';
import { Plus, Calendar, Clock, Users } from 'lucide-react';
import '../styles/admin-components.css';

const MealPlanner = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  // Sample meal assignments - in a real app, this would come from state management
  const [mealAssignments, setMealAssignments] = useState({
    'Monday-Breakfast': { id: 1, name: 'Masala Dosa', time: '8:00 AM' },
    'Monday-Lunch': { id: 2, name: 'Chicken Biryani', time: '1:00 PM' },
    'Monday-Dinner': { id: 5, name: 'Paneer Butter Masala', time: '8:00 PM' },
    'Tuesday-Breakfast': { id: 4, name: 'Pancakes', time: '8:30 AM' },
    'Wednesday-Lunch': { id: 3, name: 'Caesar Salad', time: '12:30 PM' },
  });

  const sampleDishes = [
    { id: 1, name: 'Masala Dosa', prepTime: 15, cookTime: 20, servings: 2 },
    { id: 2, name: 'Chicken Biryani', prepTime: 30, cookTime: 45, servings: 4 },
    { id: 3, name: 'Caesar Salad', prepTime: 10, cookTime: 5, servings: 2 },
    { id: 4, name: 'Pancakes', prepTime: 10, cookTime: 15, servings: 3 },
    { id: 5, name: 'Paneer Butter Masala', prepTime: 20, cookTime: 25, servings: 3 },
    { id: 6, name: 'Green Smoothie', prepTime: 5, cookTime: 0, servings: 1 },
  ];

  const assignMeal = (day, mealType, dish) => {
    const key = `${day}-${mealType}`;
    setMealAssignments(prev => ({
      ...prev,
      [key]: { ...dish, time: getDefaultTime(mealType) }
    }));
    setSelectedMeal(null);
  };

  const getDefaultTime = (mealType) => {
    const times = {
      'Breakfast': '8:00 AM',
      'Lunch': '1:00 PM',
      'Dinner': '8:00 PM',
      'Snacks': '4:00 PM'
    };
    return times[mealType] || '12:00 PM';
  };

  const removeMeal = (day, mealType) => {
    const key = `${day}-${mealType}`;
    setMealAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[key];
      return newAssignments;
    });
  };

  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Start from Monday
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const weekDates = getWeekDates(selectedWeek);

  return (
    <div className="meal-planner">
      <div className="week-view">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Meal Planner</h1>
          <div className="flex gap-2">
            <button className="btn btn-secondary">
              <Calendar size={20} />
              Previous Week
            </button>
            <button className="btn btn-secondary">
              Next Week
            </button>
          </div>
        </div>

        <div className="week-header">
          {days.map((day, index) => (
            <div key={day} className="day-header">
              <div>{day}</div>
              <div className="text-sm text-gray-500">
                {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>

        <div className="week-grid">
          {days.map((day, dayIndex) => (
            <div key={day} className="day-column">
              {mealTypes.map(mealType => {
                const key = `${day}-${mealType}`;
                const assignedMeal = mealAssignments[key];
                
                return (
                  <div key={mealType} className="meal-slot">
                    <div className="font-semibold text-sm mb-1">{mealType}</div>
                    {assignedMeal ? (
                      <div className="assigned">
                        <div className="font-medium">{assignedMeal.name}</div>
                        <div className="text-xs text-gray-600">{assignedMeal.time}</div>
                        <div className="flex gap-1 mt-2">
                          <button
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
                            onClick={() => setSelectedMeal({ day, mealType, currentMeal: assignedMeal })}
                          >
                            Change
                          </button>
                          <button
                            className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded"
                            onClick={() => removeMeal(day, mealType)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="w-full text-left text-gray-500 hover:text-gray-700"
                        onClick={() => setSelectedMeal({ day, mealType })}
                      >
                        <Plus size={16} className="inline mr-1" />
                        Add {mealType}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Meal Selection Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Select {selectedMeal.mealType} for {selectedMeal.day}
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sampleDishes.map(dish => (
                <div
                  key={dish.id}
                  className="flex justify-between items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => assignMeal(selectedMeal.day, selectedMeal.mealType, dish)}
                >
                  <div>
                    <div className="font-medium">{dish.name}</div>
                    <div className="text-sm text-gray-600">
                      <Clock size={14} className="inline mr-1" />
                      {dish.prepTime + dish.cookTime} min
                      <Users size={14} className="inline ml-2 mr-1" />
                      {dish.servings} servings
                    </div>
                  </div>
                  <button className="btn btn-primary text-sm">
                    Select
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                className="btn btn-secondary flex-1"
                onClick={() => setSelectedMeal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
