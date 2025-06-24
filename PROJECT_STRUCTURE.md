# Race Strategy Planner - Project Structure

This document outlines the organized structure of the Race Strategy Planner application.

## 📁 Project Structure

```
brm-data/
├── components/                 # Vue components
│   ├── RaceParameterForm.vue  # Input form for race parameters
│   ├── StrategyResults.vue    # Strategy analysis display
│   ├── RacePlanTable.vue      # Race plan table with validation
│   ├── PresetSaveModal.vue    # Modal for saving presets
│   └── PresetLoadModal.vue    # Modal for loading presets
├── composables/               # Vue composables (business logic)
│   ├── useRaceStrategy.js     # Race strategy calculations
│   └── usePresets.js          # Preset management
├── utils/                     # Utility functions
│   ├── timeFormatters.js      # Time formatting utilities
│   ├── raceCalculations.js    # Race calculation algorithms
│   └── presetManager.js       # LocalStorage preset management
├── pages/                     # Nuxt pages
│   └── index.vue              # Main application page
└── app.vue                    # Root application component
```

## 🧩 Components

### RaceParameterForm.vue
- **Purpose**: Input form for all race parameters
- **Features**: 
  - Race duration with unit selection (minutes/hours)
  - Lap time in MM:SS format
  - Pit stop time in MM:SS format
  - Fuel consumption and tank capacity
  - Car pace percentage
- **Events**: `calculate`, `save`, `load`

### StrategyResults.vue
- **Purpose**: Display calculated strategy overview
- **Features**:
  - Total stints and pit stops
  - Strategy type classification
  - Total laps calculation

### RacePlanTable.vue
- **Purpose**: Detailed race plan table
- **Features**:
  - Stint-by-stint breakdown
  - Time formatting in user-friendly format
  - Strategy recommendations per stint
  - Race plan validation

### PresetSaveModal.vue
- **Purpose**: Modal for saving parameter presets
- **Features**:
  - Named preset creation
  - Existing preset display
  - Overwrite confirmation

### PresetLoadModal.vue
- **Purpose**: Modal for loading saved presets
- **Features**:
  - Preset selection with summaries
  - Delete functionality
  - Empty state handling

## 🔧 Composables

### useRaceStrategy.js
- **Purpose**: Core race strategy logic
- **Responsibilities**:
  - Parameter management
  - Strategy calculations
  - Race plan generation
  - Validation logic

### usePresets.js
- **Purpose**: Preset management logic
- **Responsibilities**:
  - Modal state management
  - Preset CRUD operations
  - LocalStorage integration

## 🛠️ Utilities

### timeFormatters.js
- **Functions**:
  - `formatMinutesToMMSS()` - Convert decimal minutes to MM:SS
  - `formatSecondsToMMSS()` - Convert seconds to MM:SS
  - `formatTimeToHoursMinutesSeconds()` - Convert to H:MM:SS
  - `convertToMinutes()` - Duration unit conversion
  - `convertLapTimeToSeconds()` - Lap time conversion
  - `convertPitStopTimeToSeconds()` - Pit stop time conversion

### raceCalculations.js
- **Functions**:
  - `calculateRaceStrategy()` - Main strategy calculation
  - `generateRacePlan()` - Detailed race plan generation
  - `validateRacePlan()` - Race plan validation

### presetManager.js
- **Functions**:
  - `getAllPresets()` - Get all saved presets
  - `savePreset()` - Save preset to localStorage
  - `loadPreset()` - Load preset from localStorage
  - `deletePreset()` - Delete preset
  - `generatePresetSummary()` - Create preset summary text

## 🎯 Benefits of This Structure

### 1. **Separation of Concerns**
- UI components handle presentation
- Composables manage business logic
- Utils provide pure functions

### 2. **Reusability**
- Components can be reused across pages
- Utils can be imported anywhere
- Composables encapsulate related logic

### 3. **Maintainability**
- Each file has a single responsibility
- Easy to locate and modify specific functionality
- Clear dependencies between modules

### 4. **Testability**
- Utils are pure functions (easy to test)
- Composables can be tested independently
- Components have clear props/events

### 5. **Scalability**
- Easy to add new features
- Simple to extend existing functionality
- Clear patterns for new developers

## 🚀 Usage Examples

### Adding a New Parameter
1. Update the default params in `useRaceStrategy.js`
2. Add input field in `RaceParameterForm.vue`
3. Update calculations in `raceCalculations.js` if needed

### Adding a New Time Format
1. Add formatter function to `timeFormatters.js`
2. Import and use in relevant components

### Adding New Strategy Logic
1. Update `calculateRaceStrategy()` in `raceCalculations.js`
2. Modify `generateRacePlan()` if needed
3. Update display in `StrategyResults.vue`

## 📝 Development Guidelines

1. **Components**: Keep them focused on presentation
2. **Composables**: Handle reactive state and business logic
3. **Utils**: Write pure functions without side effects
4. **Props/Events**: Use clear, descriptive names
5. **Error Handling**: Include try-catch blocks for user operations
6. **Documentation**: Comment complex calculations and business logic

This structure provides a solid foundation for maintaining and extending the Race Strategy Planner application.