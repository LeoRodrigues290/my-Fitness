import * as SQLite from 'expo-sqlite';
import { SEED_EXERCISES } from './seedExercises';

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

    // Create Weekly Routine Table (deprecated - kept for backwards compatibility)
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS weekly_routine (
        user_id INTEGER NOT NULL,
        day_index INTEGER NOT NULL,
        workout_focus TEXT,
        PRIMARY KEY (user_id, day_index),
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // ===== MY-FITNESS 2.0 TABLES =====

    // Exercise Library - Catálogo de todos os exercícios possíveis
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS exercise_library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        video_url TEXT,
        muscle_group TEXT,
        instructions TEXT,
        default_rest_seconds INTEGER DEFAULT 60,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Workout Templates - Templates/esqueletos de treino
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        day_assigned INTEGER,
        color TEXT DEFAULT '#a3e635',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Template Exercises - Exercícios que pertencem a um template
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS template_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        target_sets INTEGER DEFAULT 3,
        target_reps TEXT DEFAULT '10-12',
        target_weight REAL,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (template_id) REFERENCES workout_templates (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercise_library (id)
      );
    `);

    // Workout Sessions - Sessões reais de treino (o que foi executado)
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        template_id INTEGER,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (template_id) REFERENCES workout_templates (id)
      );
    `);

    // Session Exercises - Exercícios executados em uma sessão
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS session_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        actual_sets INTEGER,
        actual_reps TEXT,
        actual_weight REAL,
        order_index INTEGER,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercise_library (id)
      );
    `);

    // Seed initial users if empty
    const users = await database.getAllAsync('SELECT * FROM users');
    if (users.length === 0) {
      await database.runAsync('INSERT INTO users (name) VALUES (?)', 'User 1');
      await database.runAsync('INSERT INTO users (name) VALUES (?)', 'User 2');
    }

    // Seed exercise library if empty
    const exercises = await database.getAllAsync('SELECT COUNT(*) as count FROM exercise_library');
    const exerciseCount = (exercises[0] as { count: number }).count;
    if (exerciseCount === 0) {
      console.log('Seeding exercise library with', SEED_EXERCISES.length, 'exercises...');
      for (const exercise of SEED_EXERCISES) {
        try {
          await database.runAsync(
            `INSERT OR IGNORE INTO exercise_library (name, muscle_group, video_url, instructions, default_rest_seconds) 
             VALUES (?, ?, ?, ?, ?)`,
            exercise.name,
            exercise.muscle_group,
            exercise.video_url,
            exercise.instructions,
            exercise.default_rest_seconds
          );
        } catch (e) {
          // Skip duplicates silently
        }
      }
      console.log('Exercise library seeded successfully');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};
