import React, { useState } from 'react';
import { X, ChevronRight, Activity } from 'lucide-react';

interface NotificationsComponentProps {
    onClose: () => void;
}

const NotificationsComponent: React.FC<NotificationsComponentProps> = ({ onClose }) => {
    const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

    // Mock notification data
    const notifications = [
        {
            id: '1',
            sender: 'דן הפיזיותרפיסט',
            title: 'התוכנית השבועית שלך עודכנה',
            time: 'לפני שעתיים',
            avatar: 'https://i.pravatar.cc/150?img=3',
            message: 'שלום, עדכנתי את תוכנית השיקום השבועית שלך במערכת. התרגילים החדשים נועדו לחזק את שרירי הרגליים ולשפר את שיווי המשקל. אם יש לך שאלות או שאתה מרגיש אי נוחות, אנא צור איתי קשר מיד. בהצלחה!',
            unread: true
        }
    ];

    // Function to handle notification click
    const handleNotificationClick = (id: string) => {
        setSelectedNotification(id);
    };

    // Return to notification list
    const handleBackToList = () => {
        setSelectedNotification(null);
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold" dir="rtl">התראות</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="סגור"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {selectedNotification ? (
                        <div className="h-full flex flex-col">
                            {/* Message header */}
                            <div className="flex items-center mb-4">
                                <button onClick={handleBackToList} className="mr-2">
                                    <ChevronRight size={24} />
                                </button>
                                <div className="flex-1" dir="rtl">
                                    <h3 className="font-bold text-lg">
                                        {notifications.find(n => n.id === selectedNotification)?.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {notifications.find(n => n.id === selectedNotification)?.sender} • {notifications.find(n => n.id === selectedNotification)?.time}
                                    </p>
                                </div>
                            </div>

                            {/* Message content */}
                            <div
                                className="bg-gray-50 p-4 rounded-lg mb-4 flex-1"
                                dir="rtl"
                            >
                                <p className="text-gray-800 leading-relaxed">
                                    {notifications.find(n => n.id === selectedNotification)?.message}
                                </p>
                            </div>

                            {/* No action buttons */}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`py-4 flex items-start cursor-pointer hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}
                                        onClick={() => handleNotificationClick(notification.id)}
                                    >
                                        <div className="relative mr-3">
                                            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
                                                <Activity size={24} className="text-blue-500" />
                                            </div>
                                            {notification.unread && (
                                                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1" dir="rtl">
                                            <div className="flex justify-between">
                                                <h3 className="font-bold">{notification.sender}</h3>
                                                <span className="text-xs text-gray-500">{notification.time}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium mt-1">{notification.title}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <p>אין התראות חדשות</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsComponent;