import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

// Open database helper
export const getDBConnection = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('myfitness.db');
  }
  return db;
};

export const initDatabase = async () => {
  const database = await getDBConnection();

  try {
    // Create Users Table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        avatar_uri TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Workouts Table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        muscle_group TEXT,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Create Workout Exercises Table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        exercise_name TEXT NOT NULL,
        sets INTEGER DEFAULT 0,
        reps INTEGER DEFAULT 0,
        weight REAL DEFAULT 0,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
      );
    `);

    // Create Weight Logs Table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS weight_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        weight REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Create User Goals Table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS user_goals (
        user_id INTEGER PRIMARY KEY,
        calorie_goal INTEGER DEFAULT 2000,
        burn_goal INTEGER DEFAULT 500,
        protein_goal INTEGER DEFAULT 150,
        carbs_goal INTEGER DEFAULT 250,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Create Meals Table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        type TEXT,
        name TEXT,
        calories REAL DEFAULT 0,
        protein REAL DEFAULT 0,
        carbs REAL DEFAULT 0,
        fats REAL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Create Weekly Routine Table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS weekly_routine (
        user_id INTEGER NOT NULL,
        day_index INTEGER NOT NULL,
        workout_focus TEXT,
        PRIMARY KEY (user_id, day_index),
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Seed initial users if empty
    // REMOVED - Using OnboardingScreen for first user creation
    /*
    const users = await database.getAllAsync('SELECT * FROM users');
    if (users.length === 0) {
      await database.runAsync('INSERT INTO users (name) VALUES (?)', 'Atleta');
    }
    */

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};
