import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

interface CameraComponentProps {
    onClose: () => void;
    onImageCapture?: (imageSrc: string) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onClose, onImageCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);

    // פתיחת המצלמה
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            setStream(mediaStream);
            setPermissionDenied(false);
        } catch (err) {
            console.error('שגיאה בגישה למצלמה:', err);
            setPermissionDenied(true);
        }
    };

    // סגירת המצלמה
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    // התחלת ספירה לאחור לפני הצילום
    const startCountdown = () => {
        setCountdown(3);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev === 1) {
                    clearInterval(timer);
                    captureImage();
                    return null;
                }
                return prev ? prev - 1 : null;
            });
        }, 1000);
    };

    // צילום תמונה
    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // התאמת גודל הקנבס לגודל הוידאו
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // ציור הפריים הנוכחי על הקנבס
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // המרה לתמונה
                const imageSrc = canvas.toDataURL('image/png');
                setCapturedImage(imageSrc);

                // העברת התמונה לקומפוננטת האב, אם נדרש
                if (onImageCapture) {
                    onImageCapture(imageSrc);
                }
            }
        }
    };

    // צילום תמונה חדשה
    const retakePhoto = () => {
        setCapturedImage(null);
    };

    // פתיחת המצלמה בטעינת הקומפוננטה
    useEffect(() => {
        startCamera();

        // סגירת המצלמה כשהקומפוננטה יורדת מהמסך
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full" dir="rtl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">מצלמת תרגול</h3>
                    <button
                        onClick={() => {
                            stopCamera();
                            onClose();
                        }}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        סגור
                    </button>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-gray-100 mb-4">
                    {permissionDenied ? (
                        <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
                            <Camera size={48} className="text-gray-400 mb-2" />
                            <p className="text-red-500 font-medium">לא ניתן לגשת למצלמה</p>
                            <p className="text-gray-500 text-sm mt-2">אנא אשר גישה למצלמה בדפדפן ונסה שוב</p>
                        </div>
                    ) : capturedImage ? (
                        // הצגת התמונה שצולמה
                        <img
                            src={capturedImage}
                            alt="תמונה שצולמה"
                            className="w-full object-contain max-h-64"
                        />
                    ) : (
                        // הצגת שידור המצלמה החיה
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full max-h-64 object-contain"
                            />
                            {countdown !== null && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black bg-opacity-50 text-white text-4xl font-bold rounded-full w-16 h-16 flex items-center justify-center">
                                        {countdown}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* קנבס נסתר לצילום התמונה */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex justify-center gap-4">
                    {capturedImage ? (
                        <>
                            <button
                                onClick={retakePhoto}
                                className="bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-full"
                            >
                                צלם שוב
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-blue-500 text-white font-medium py-2 px-6 rounded-full"
                            >
                                אישור
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={startCountdown}
                            disabled={countdown !== null || !stream}
                            className={`bg-blue-500 text-white font-medium py-2 px-6 rounded-full ${
                                (countdown !== null || !stream) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {countdown !== null ? `צילום בעוד ${countdown}...` : 'צלם תמונה'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraComponent;