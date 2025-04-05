import React, { useState, useEffect } from 'react';
import Supermen from '../images/supermen.jpg';
import CameraComponent from './CameraComponent';
import { exerciseLogger } from './ExerciseLogger'; // ייבוא שירות התיעוד

interface Exercise {
    id: string;
    name: string;
    description: string;
    image?: string;
}

interface ExerciseCategory {
    id: string;
    name: string;
    exercises: Exercise[];
}

interface ExercisesComponentProps {
    onClose: () => void;
    onExerciseComplete?: (exerciseLog: any) => void; // פונקציית קולבק אופציונלית
}

const ExercisesComponent: React.FC<ExercisesComponentProps> = ({ onClose, onExerciseComplete }) => {
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [showImageConfirmation, setShowImageConfirmation] = useState<boolean>(false);
    const [exerciseCompleted, setExerciseCompleted] = useState<boolean>(false);
    const [completionNotes, setCompletionNotes] = useState<string>('');

    const categories: ExerciseCategory[] = [
        {
            id: 'lower-back',
            name: 'גב תחתון',
            exercises: [
                {
                    id: 'superman',
                    name: 'סופרמן',
                    description: 'תרגיל סופרמן מחזק את שרירי הגב התחתון. שכב על הבטן, הרם את הידיים והרגליים מעל הרצפה ושמור על מתיחה קלה. החזק למשך 5 שניות וחזור למצב התחלתי. חזור על התרגיל 10 פעמים. --  -- -- -- --   ---------------------------------------------------- מוכן לתרגיל? מקם את הפלאפון כדי שנוכל לנתח את התנועה שלך, כך נוכל לדייק את התנועה והשרירים יעבדו כמו שצריך',
                    image: Supermen
                },
                {
                    id: 'bird-dog',
                    name: 'ברד-דוג',
                    description: 'תרגיל ברד-דוג מחזק את שרירי הגב התחתון ומשפר את היציבה. התחל בעמידת שש על הברכיים והידיים (עמידת שולחן). הרם את יד שמאל קדימה במקביל לרצפה ובו-זמנית הרם את רגל ימין לאחור במקביל לרצפה. שמור על הגב ישר והבטן מכווצת. החזק למשך 3 שניות וחזור למצב התחלתי. חזור על התרגיל עם יד ימין ורגל שמאל. בצע 10 חזרות לכל צד.',
                    image: '/api/placeholder/400/300'
                }
            ]
        },
        {
            id: 'right-knee',
            name: 'ברך ימין',
            exercises: [
                {
                    id: 'leg-flexion',
                    name: 'כיפוף וישור רגל',
                    description: 'תרגיל זה מחזק את שרירי הברך ומשפר טווח תנועה. שב על כיסא, כופף את רגל ימין באיטיות ואז ישר אותה חזרה. חזור על התרגיל 15 פעמים ב-3 סטים. וודא שהתנועה איטית ומבוקרת.',
                    image: 'https://cdnjs.cloudflare.com/ajax/libs/twbs-placeholder-img/1.0.0/80x80.png'
                },
                {
                    id: 'hamstring-stretch',
                    name: 'מתיחת גידי הברך',
                    description: 'תרגיל זה מותח את גידי הברך ומסייע להקלה בכאבי ברך. שב על קצה כיסא עם רגל ימין ישרה וקרסול מכופף. הישען מעט קדימה מהמותניים עד שתרגיש מתיחה בחלק האחורי של הרגל. שמור על הגב ישר ואל תעגל אותו. החזק את המתיחה למשך 30 שניות וחזור 3 פעמים.',
                    image: '/api/placeholder/400/300'
                }
            ]
        },
        {
            id: 'neck',
            name: 'צוואר',
            exercises: [
                {
                    id: 'neck-stretch',
                    name: 'מתיחות צוואר',
                    description: 'תרגיל זה מסייע בהקלה על מתח בצוואר ובשיפור טווח התנועה. שב זקוף, הטה את הראש באיטיות לצד ימין עד שתרגיש מתיחה קלה בצד שמאל של הצוואר. החזק למשך 15-20 שניות, חזור למרכז וחזור על התרגיל לצד השני. בצע 3 חזרות לכל צד. ניתן גם לבצע הטיה קדימה ואחורה באותה שיטה.',
                    image: '/api/placeholder/400/300'
                }
            ]
        }
    ];

    const handleExerciseClick = (exercise: Exercise, category: ExerciseCategory) => {
        setSelectedExercise(exercise);
        setSelectedCategory(category);
    };

    const handleStartExercise = () => {
        setShowCamera(true);
    };

    const handleCloseCamera = () => {
        setShowCamera(false);
    };

    const handleImageCapture = (imageSrc: string) => {
        setCapturedImage(imageSrc);
        setShowCamera(false);
        setShowImageConfirmation(true);
    };

    const handleConfirmImage = async () => {
        if (selectedExercise && selectedCategory) {
            setExerciseCompleted(true);

            // תיעוד הפעילות באמצעות שירות התיעוד
            try {
                const logEntry = await exerciseLogger.logExerciseActivity({
                    exerciseId: selectedExercise.id,
                    exerciseName: selectedExercise.name,
                    categoryId: selectedCategory.id,
                    categoryName: selectedCategory.name,
                    imageUrl: capturedImage || undefined,
                    completed: true,
                    notes: completionNotes
                });

                console.log('Exercise activity logged:', logEntry);

                // קריאה לפונקציית קולבק אם היא קיימת
                if (onExerciseComplete) {
                    onExerciseComplete(logEntry);
                }

                // הצגת הודעת הצלחה למשתמש
                alert(`התרגיל "${selectedExercise.name}" הושלם ותועד בהצלחה!`);

                // סגירת הפופ-אפים
                setShowImageConfirmation(false);
                setSelectedExercise(null);
                onClose();
            } catch (error) {
                console.error('Failed to log exercise activity:', error);
                alert('אירעה שגיאה בתיעוד הפעילות. אנא נסה שוב.');
            }
        }
    };

    // פונקציה להוספת הערות לתיעוד
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCompletionNotes(e.target.value);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">תרגילים מומלצים</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        סגור
                    </button>
                </div>

                <div className="space-y-6" dir="rtl">
                    {categories.map((category) => (
                        <div key={category.id} className="border rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-3">{category.name}</h3>
                            <div className="space-y-2">
                                {category.exercises.map((exercise) => (
                                    <button
                                        key={exercise.id}
                                        onClick={() => handleExerciseClick(exercise, category)}
                                        className="w-full text-right bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg"
                                    >
                                        {exercise.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Exercise details popup */}
            {selectedExercise && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                    <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full" dir="rtl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{selectedExercise.name}</h3>
                            <button
                                onClick={() => setSelectedExercise(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                סגור
                            </button>
                        </div>

                        <div className="mb-4 flex justify-center">
                            <img
                                src={selectedExercise.image || '/api/placeholder/400/300'}
                                alt={selectedExercise.name}
                                className="max-h-64 object-contain rounded-lg"
                            />
                        </div>

                        <p className="text-gray-700 text-lg">
                            {selectedExercise.description}
                        </p>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleStartExercise}
                                className="bg-blue-500 text-white font-medium py-2 px-6 rounded-full"
                            >
                                קדימה
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* הצגת קומפוננטת המצלמה כאשר לוחצים על כפתור "קדימה" */}
            {showCamera && (
                <CameraComponent
                    onClose={handleCloseCamera}
                    onImageCapture={handleImageCapture}
                />
            )}

            {/* פופ-אפ לאישור התמונה ותיעוד המשימה */}
            {showImageConfirmation && capturedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full" dir="rtl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">תיעוד התרגיל</h3>
                            <button
                                onClick={() => setShowImageConfirmation(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                סגור
                            </button>
                        </div>

                        <div className="mb-4 flex justify-center">
                            <img
                                src={capturedImage}
                                alt="תמונה שצולמה"
                                className="max-h-64 object-contain rounded-lg"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="exerciseNotes" className="block text-gray-700 font-medium mb-2">הערות:</label>
                            <textarea
                                id="exerciseNotes"
                                rows={3}
                                className="w-full border rounded-lg p-2"
                                placeholder="הוסף הערות לגבי ביצוע התרגיל (אופציונלי)"
                                value={completionNotes}
                                onChange={handleNotesChange}
                            />
                        </div>

                        <div className="mt-6 flex justify-center space-x-4 space-x-reverse">
                            <button
                                onClick={handleConfirmImage}
                                className="bg-green-500 text-white font-medium py-2 px-6 rounded-full"
                            >
                                תעד והשלם
                            </button>
                            <button
                                onClick={() => {
                                    setShowImageConfirmation(false);
                                    setShowCamera(true);
                                }}
                                className="bg-blue-500 text-white font-medium py-2 px-6 rounded-full"
                            >
                                צלם שוב
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExercisesComponent;