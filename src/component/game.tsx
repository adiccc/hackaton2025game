import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShoppingBag, Award, Users, Bell } from 'lucide-react';
import Background from '../images/background.jpeg';
import Carrot from '../images/carrot.png';
import Fence from '../images/fence.png';
import Logs from '../images/logs.png';
import Well from '../images/well.png';
import Character from '../images/Character.png';
import DragonLandscape from '../images/otherWorld.png';
import ExercisesComponent from '../component/ExercisesComponents';
import NotificationsComponent from '../component/NotificationsComponent';

// Define types
interface ShopItem {
    id: string;
    name: string;
    price: number;
    width: number;
    height: number;
}

interface PlacedItem extends ShopItem {
    left: number;
    top: number;
    originalId: string;
}

interface DragOffset {
    x: number;
    y: number;
}

const Game: React.FC = () => {
    const [coins, setCoins] = useState<number>(100);
    const [progress, setProgress] = useState<number>(30);
    const [showMissions, setShowMissions] = useState<boolean>(false);
    const [showShop, setShowShop] = useState<boolean>(false);
    const [showPlayers, setShowPlayers] = useState<boolean>(false);
    const [showExercises, setShowExercises] = useState<boolean>(false);
    const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
    const [showWelcomeAnimation, setShowWelcomeAnimation] = useState<boolean>(true);
    const [showVisitScreen, setShowVisitScreen] = useState<boolean>(false);
    const [visitingPlayer, setVisitingPlayer] = useState<string>("");
    const [characterEntrance, setCharacterEntrance] = useState<boolean>(true);
    const [characterJumping, setCharacterJumping] = useState<boolean>(false);
    const [showEncouragement, setShowEncouragement] = useState<boolean>(false);
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [unreadNotifications, setUnreadNotifications] = useState<number>(1);

    const gameAreaRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio element once when component mounts
    useEffect(() => {
        audioRef.current = new Audio("/sounds/cachier.mp3");
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Function to play cashier sound
    const playCashierSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(error => {
                console.error("Error playing sound:", error);
            });
        }
    };

    // Auto-disable character entrance animation after 2 seconds
    useEffect(() => {
        if (characterEntrance) {
            const timer = setTimeout(() => {
                setCharacterEntrance(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [characterEntrance]);

    // Mock data for other players
    const otherPlayers = [
        {
            id: 1,
            name: 'Garden Master',
            level: 42,
            items: 24,
            progress: 78,
            avatar: 'https://i.pravatar.cc/150?img=1'
        },
        {
            id: 2,
            name: 'FarmQueen',
            level: 37,
            items: 18,
            progress: 65,
            avatar: 'https://i.pravatar.cc/150?img=5'
        },
        {
            id: 3,
            name: 'GreenThumb',
            level: 51,
            items: 32,
            progress: 92,
            avatar: 'https://i.pravatar.cc/150?img=8'
        },
        {
            id: 4,
            name: 'HarvestKing',
            level: 29,
            items: 15,
            progress: 48,
            avatar: 'https://i.pravatar.cc/150?img=12'
        }
    ];

    const getItemImage = (itemId: string): string => {
        const baseId = (itemId || '').split('-')[0];

        switch(baseId) {
            case 'well':
                return Well;
            case 'carrot':
                return Carrot;
            case 'logs':
                return Logs;
            case 'fence':
                return Fence;
            default:
                return '';
        }
    };

    const shopItems: ShopItem[] = [
        { id: 'well', name: 'Wishing Well', price: 20, width: 180, height: 180 },
        { id: 'carrot', name: 'Carrot', price: 10, width: 140, height: 140 },
        { id: 'logs', name: 'Log Pile', price: 15, width: 180, height: 130 },
        { id: 'fence', name: 'Fence', price: 25, width: 180, height: 90 }
    ];

    // Function to handle visiting a player
    const handleVisitPlayer = (playerName: string) => {
        setVisitingPlayer(playerName);
        setShowPlayers(false);
        setShowVisitScreen(true);
    };

    // Function to return from visit
    const handleReturnFromVisit = () => {
        setShowVisitScreen(false);
        setVisitingPlayer("");
    };

    const buyItem = (item: ShopItem): void => {
        if (coins >= item.price) {
            setCoins(coins - item.price);

            // Play sound
            playCashierSound();

            // Calculate game area dimensions
            const gameArea = gameAreaRef.current;
            const rect = gameArea ? gameArea.getBoundingClientRect() : { width: 800, height: 600 };

            // Add the item to the farm at a random position
            const newItem: PlacedItem = {
                ...item,
                originalId: item.id,
                id: `${item.id}-${Date.now()}`,
                left: Math.floor(Math.random() * (rect.width - item.width * 2)) + item.width,
                top: Math.floor(Math.random() * (rect.height / 2)) + (rect.height / 3),
            };
            setPlacedItems([...placedItems, newItem]);
            setProgress(Math.min(100, progress + 5));

            // Close shop after purchase
            setShowShop(false);
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, index: number): void => {
        e.preventDefault();

        // Calculate the offset of the mouse from the item's top-left corner
        const rect = e.currentTarget.getBoundingClientRect();
        let clientX: number, clientY: number;

        if ('clientX' in e) {
            // It's a mouse event
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            // It's a touch event
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;

        setDragOffset({ x: offsetX, y: offsetY });
        setDraggingIndex(index);
    };

    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent): void => {
        if (draggingIndex === null) return;

        e.preventDefault();
        const gameArea = gameAreaRef.current;
        if (!gameArea) return;

        const gameRect = gameArea.getBoundingClientRect();
        const item = placedItems[draggingIndex];

        // Get client coordinates
        let clientX: number, clientY: number;

        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = (e as TouchEvent).touches[0].clientX;
            clientY = (e as TouchEvent).touches[0].clientY;
        }

        // Calculate new position, taking the offset into account
        const newLeft = clientX - gameRect.left - dragOffset.x;
        const newTop = clientY - gameRect.top - dragOffset.y;

        // Make sure item stays within bounds
        const boundedLeft = Math.max(0, Math.min(gameRect.width - item.width, newLeft));
        const boundedTop = Math.max(0, Math.min(gameRect.height - item.height, newTop));

        // Update the item position
        const updatedItems = [...placedItems];
        updatedItems[draggingIndex] = { ...item, left: boundedLeft, top: boundedTop };
        setPlacedItems(updatedItems);
    }, [draggingIndex, placedItems, dragOffset]);

    const handleMouseUp = useCallback((): void => {
        setDraggingIndex(null);
    }, []);

    // Function to handle Ready button click in Missions popup
    const handleReadyClick = () => {
        setShowMissions(false);
        setCoins(coins + 10);
        setProgress(Math.min(100, progress + 5));
        setShowExercises(true);
    };

    // Add and remove event listeners for dragging
    useEffect(() => {
        if (draggingIndex !== null) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove);
            window.addEventListener('touchend', handleMouseUp);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('touchmove', handleMouseMove);
                window.removeEventListener('touchend', handleMouseUp);
            };
        }
    }, [draggingIndex, handleMouseMove, handleMouseUp]);

    // Display visit screen if active
    if (showVisitScreen) {
        return (
            <div className="relative w-full h-screen overflow-hidden">
                {/* Dragon landscape full screen */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${DragonLandscape})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                ></div>

                {/* Visit overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-white bg-opacity-70">
                    <div className="text-xl font-bold">{visitingPlayer}: ביקור בעולם של   </div>
                    <button
                        onClick={handleReturnFromVisit}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        חזרה הביתה
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={gameAreaRef}
            className="relative w-full h-screen overflow-hidden cursor-default"
            style={{
                touchAction: draggingIndex !== null ? 'none' : 'auto',
                cursor: draggingIndex !== null ? 'grabbing' : 'default'
            }}
        >
            {/* Farm background */}
            <div
                className="absolute inset-0 bg-green-100"
                style={{
                    backgroundImage: `url(${Background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            ></div>

            {/* Placed purchased items */}
            {placedItems.map((item, index) => {
                const itemId = item.originalId || item.id;
                const imageUrl = getItemImage(itemId);

                return (
                    <div
                        key={item.id}
                        className={`absolute z-10 flex items-center justify-center ${draggingIndex === index ? 'cursor-grabbing' : 'cursor-grab'}`}
                        style={{
                            left: `${item.left}px`,
                            top: `${item.top}px`,
                            width: `${item.width}px`,
                            height: `${item.height}px`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, index)}
                        onTouchStart={(e) => handleMouseDown(e, index)}
                    >
                        <img
                            src={imageUrl}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                );
            })}

            {/* UI Overlay */}
            <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-start">
                {/* Progress and coins */}
                <div className="bg-white bg-opacity-80 rounded-lg p-3 shadow-lg">
                    <div className="mb-2">
                        <div className="text-sm font-bold mb-1">Progress</div>
                        <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="w-5 h-5 bg-yellow-400 rounded-full mr-2"></div>
                        <div className="font-bold">{coins}</div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => setShowMissions(true)}
                        className="flex flex-col items-center bg-white bg-opacity-80 rounded-lg p-3 shadow-lg"
                    >
                        <Award size={24} className="text-blue-500" />
                        <div className="text-xs mt-1">פעילויות</div>
                    </button>

                    <button
                        onClick={() => setShowShop(true)}
                        className="flex flex-col items-center bg-white bg-opacity-80 rounded-lg p-3 shadow-lg"
                    >
                        <ShoppingBag size={24} className="text-green-500" />
                        <div className="text-xs mt-1">חנות</div>
                    </button>

                    <button
                        onClick={() => setShowPlayers(true)}
                        className="flex flex-col items-center bg-white bg-opacity-80 rounded-lg p-3 shadow-lg"
                    >
                        <Users size={24} className="text-purple-500" />
                        <div className="text-xs mt-1">החברים שלי</div>
                    </button>

                    <button
                        onClick={() => setShowNotifications(true)}
                        className="flex flex-col items-center bg-white bg-opacity-80 rounded-lg p-3 shadow-lg relative"
                    >
                        <Bell size={24} className="text-orange-500" />
                        <div className="text-xs mt-1">התראות</div>
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {unreadNotifications}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Missions Popup */}
            {showMissions && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-white rounded-xl p-6 max-w-md mx-4">
                        <h2 className="text-xl font-bold mb-4 text-center">הפעילויות שלי להיום </h2>
                        <p className="text-center mb-6" dir="rtl">קדימה מתחילים לצבור מטבעות. מוכן למשימה שלך?</p>
                        <div className="flex justify-center">
                            <button
                                onClick={handleReadyClick}
                                className="bg-green-500 text-white font-bold py-2 px-6 rounded-full"
                            >
                                !מתחילים
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Players Popup */}
            {showPlayers && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">העולמות של החברים שלי</h2>
                            <button
                                onClick={() => setShowPlayers(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                סגור
                            </button>
                        </div>

                        <div className="divide-y">
                            {otherPlayers.map((player) => (
                                <div key={player.id} className="py-4 flex items-center">
                                    <img
                                        src={player.avatar}
                                        alt={`${player.name}'s avatar`}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold">{player.name}</h3>
                                        <div className="text-sm text-gray-600">
                                            Level {player.level} • {player.items} items
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                            <div
                                                className="h-full bg-purple-500 rounded-full"
                                                style={{ width: `${player.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <button
                                        className="ml-4 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-sm font-medium"
                                        onClick={() => handleVisitPlayer(player.name)}
                                    >
                                        בקר
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {showShop && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">חנות</h2>
                            <button
                                onClick={() => setShowShop(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {shopItems.map((item) => (
                                <div key={item.id} className="border rounded-lg p-3 flex flex-col items-center">
                                    <div
                                        className="w-40 h-40 flex items-center justify-center mb-2"
                                    >
                                        <img
                                            src={getItemImage(item.id)}
                                            alt={item.name}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="font-bold">{item.name}</div>
                                    <div className="flex items-center my-2">
                                        <div className="w-4 h-4 bg-yellow-400 rounded-full mr-1"></div>
                                        <div>{item.price}</div>
                                    </div>
                                    <button
                                        onClick={() => buyItem(item)}
                                        disabled={coins < item.price}
                                        className={`px-4 py-1 rounded-full text-sm font-bold ${
                                            coins >= item.price
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        קנה
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Exercises Component */}
            {showExercises && (
                <ExercisesComponent onClose={() => {
                    setShowExercises(false);
                    // Start character jumping animation
                    setCharacterJumping(true);
                    // Show encouragement message
                    setShowEncouragement(true);

                    // Stop jumping after 2 seconds
                    setTimeout(() => {
                        setCharacterJumping(false);
                    }, 2000);

                    // Hide encouragement after 3 seconds
                    setTimeout(() => {
                        setShowEncouragement(false);
                    }, 3000);
                }} />
            )}

            {/* Notifications Component */}
            {showNotifications && (
                <NotificationsComponent
                    onClose={() => {
                        setShowNotifications(false);
                        setUnreadNotifications(0); // Clear unread count when closing notifications
                    }}
                />
            )}

            {/* Main Character with entrance and jumping animations */}
            <div
                className={`absolute z-10 transition-all duration-1000 ease-out ${
                    characterEntrance
                        ? 'opacity-0 translate-y-full'
                        : 'opacity-100 translate-y-0'
                } ${
                    characterJumping ? 'animate-bounce' : ''
                }`}
                style={{
                    width: '220px',
                    height: '300px',
                    bottom: '10%',
                    left: '50%',
                    transform: `translateX(-50%) translateY(${characterEntrance ? '100%' : '0'})`
                }}
            >
                <img
                    src={Character}
                    alt="Main Character"
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            {/* Encouragement message after exercises */}
            {showEncouragement && (
                <div className="absolute z-30 left-1/2 top-1/4 transform -translate-x-1/2 bg-white bg-opacity-90 p-6 rounded-xl shadow-lg animate-pulse">
                    <div className="text-2xl font-bold text-center text-green-600 mb-2" dir="rtl">כל הכבוד!</div>
                    <div className="text-lg text-center" dir="rtl">
                        עבודה מצוינת בהשלמת המשימה!
                    </div>
                </div>
            )}

            {/* Welcome Animation */}
            {showWelcomeAnimation && (
                <div className="absolute top-1/4 right-1/4 z-30 bg-white bg-opacity-80 p-6 rounded-xl shadow-lg transform animate-bounce">
                    <div className="text-2xl font-bold text-center text-blue-600 mb-2">!ברוכים הבאים לחווה שלך</div>
                    <div className="text-lg text-center" dir="rtl">
                        התחל לבצע משימות כדי לצבור מטבעות ולהרחיב את החווה
                    </div>
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => {
                                setShowWelcomeAnimation(false);
                                // No longer opening missions screen
                            }}
                            className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition-colors"
                        >
                            קדימה
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;