// types.ts
// הגדרות טיפוסים עבור האפליקציה

// הגדרת טיפוס Exercise עבור תרגיל בודד
export interface Exercise {
    id: string;
    name: string;
    description: string;
    image?: string;
}

// הגדרת טיפוס ExerciseCategory עבור קטגוריה של תרגילים
export interface ExerciseCategory {
    id: string;
    name: string;
    exercises: Exercise[];
}

// הגדרות טיפוסים עבור תיעוד פעילויות
export interface ExerciseLogBase {
    exerciseId: string;
    exerciseName: string;
    categoryId: string;
    categoryName: string;
    imageUrl?: string;
    completed: boolean;
    notes?: string;
}

// טיפוסים נוספים שעשויים להידרש
export interface User {
    id: string;
    name: string;
    email?: string;
}

export enum ExerciseDifficulty {
    Easy = 'easy',
    Medium = 'medium',
    Hard = 'hard'
}

// ניתן להוסיף טיפוסים נוספים לפי הצורך
// ממשק עבור רשומת תיעוד פעילות
export interface ExerciseLogEntry {
    id: string;
    exerciseId: string;
    exerciseName: string;
    categoryId: string;
    categoryName: string;
    timestamp: Date;
    imageUrl?: string;
    completed: boolean;
    notes?: string;
}

// ממשק עבור שירות התיעוד
export interface ExerciseLoggerService {
    logExerciseActivity(entry: Omit<ExerciseLogEntry, 'id' | 'timestamp'>): Promise<ExerciseLogEntry>;
    getExerciseLogs(): Promise<ExerciseLogEntry[]>;
    getExerciseLogsByDate(date: Date): Promise<ExerciseLogEntry[]>;
    clearLogs(): Promise<void>;
}

// מימוש השירות עם localStorage וייצוא קבצים
export class DownloadExerciseLogger implements ExerciseLoggerService {
    private readonly STORAGE_KEY = 'exercise_activity_logs';

    // מחלץ את הלוגים מהאחסון המקומי
    private getLogs(): ExerciseLogEntry[] {
        const logsJson = localStorage.getItem(this.STORAGE_KEY);
        if (!logsJson) {
            return [];
        }
        try {
            // המרת string dates לאובייקטי Date
            const parsedLogs = JSON.parse(logsJson);
            return parsedLogs.map((log: any) => ({
                ...log,
                timestamp: new Date(log.timestamp)
            }));
        } catch (e) {
            console.error('Failed to parse exercise logs:', e);
            return [];
        }
    }

    // שומר את הלוגים באחסון המקומי
    private saveLogs(logs: ExerciseLogEntry[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    }

    // מייצא את הלוגים כקובץ
    private downloadLogsFile(logs: ExerciseLogEntry[]): void {
        const dataStr = JSON.stringify(logs, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportFileDefaultName = `exercise_logs_${timestamp}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.style.display = 'none';
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
    }

    // מתעד פעילות תרגיל חדשה ושומר לקובץ
    async logExerciseActivity(entry: Omit<ExerciseLogEntry, 'id' | 'timestamp'>): Promise<ExerciseLogEntry> {
        const logs = this.getLogs();
        const newEntry: ExerciseLogEntry = {
            ...entry,
            id: this.generateId(),
            timestamp: new Date(),
        };

        logs.push(newEntry);
        this.saveLogs(logs);

        // יצירת קובץ להורדה כל פעם שמתווסף לוג חדש
        this.downloadLogsFile(logs);

        return newEntry;
    }

    // מחזיר את כל הלוגים
    async getExerciseLogs(): Promise<ExerciseLogEntry[]> {
        return this.getLogs();
    }

    // מחזיר לוגים לפי תאריך מסוים
    async getExerciseLogsByDate(date: Date): Promise<ExerciseLogEntry[]> {
        const logs = this.getLogs();
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        return logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= targetDate && logDate < nextDay;
        });
    }

    // מוחק את כל הלוגים
    async clearLogs(): Promise<void> {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    // מייצר מזהה ייחודי לרשומה
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
}

// יצירת מופע יחיד של השירות (Singleton)
export const exerciseLogger = new DownloadExerciseLogger();

// פונקציה עזר לייצוא הלוגים לקובץ JSON
export const exportLogsToFile = async (): Promise<void> => {
    const logger = exerciseLogger;
    const logs = await logger.getExerciseLogs();

    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `exercise_logs_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};