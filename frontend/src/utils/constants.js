export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACKS: 'snacks'
};

export const MEAL_ICONS = {
  [MEAL_TYPES.BREAKFAST]: '🌅',
  [MEAL_TYPES.LUNCH]: '☀️',
  [MEAL_TYPES.DINNER]: '🌙',
  [MEAL_TYPES.SNACKS]: '🍿'
};

export const NUTRIENTS = {
  CALORIES: 'calories',
  PROTEIN: 'protein',
  CARBS: 'carbs',
  FAT: 'fat',
  FIBER: 'fiber'
};

export const NUTRIENT_UNITS = {
  [NUTRIENTS.CALORIES]: 'cal',
  [NUTRIENTS.PROTEIN]: 'g',
  [NUTRIENTS.CARBS]: 'g',
  [NUTRIENTS.FAT]: 'g',
  [NUTRIENTS.FIBER]: 'g'
};

export const DEFAULT_GOALS = {
  daily_calories: 2000,
  daily_protein: 50,
  daily_carbs: 275,
  daily_fat: 78,
  daily_fiber: 28
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  USERS: {
    PROFILE: '/users/profile',
    GOALS: '/users/goals',
    PASSWORD: '/users/change-password'
  },
  FOODS: {
    SEARCH: '/foods/search',
    CUSTOM: '/foods/custom',
    BY_ID: (id) => `/foods/${id}`
  },
  ENTRIES: {
    BASE: '/entries',
    BY_ID: (id) => `/entries/${id}`,
    BY_DATE: '/entries'
  },
  SUMMARY: {
    DAILY: (date) => `/summary/${date}`,
    WEEKLY: (date) => `/summary/week/${date}`
  },
  MEALS: {
    BASE: '/meals',
    BY_ID: (id) => `/meals/${id}`,
    ADD: (id) => `/meals/${id}/add`
  }
};