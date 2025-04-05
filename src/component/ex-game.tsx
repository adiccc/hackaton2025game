// import React, { useState, useRef, useEffect } from 'react';
// import { ShoppingBag, Award } from 'lucide-react';
//
// const ExGame = () => {
//   const [coins, setCoins] = useState(100);
//   const [progress, setProgress] = useState(30);
//   const [showMissions, setShowMissions] = useState(false);
//   const [showShop, setShowShop] = useState(false);
//   const [placedItems, setPlacedItems] = useState([]);
//   const [draggingIndex, setDraggingIndex] = useState(null);
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
//   const gameAreaRef = useRef(null);
//
//   // Get real image URLs based on the provided images
//   const getImageUrl = (itemId:string) => {
//     switch(itemId) {
//       case 'well':
//         return '/Users/adicohen/Documents/game/src/images/carrot.png'; // שם קובץ הבאר שלך
//       case 'carrot':
//         return '/images/carrot.png'; // שם קובץ הגזר שלך
//       case 'logs':
//         return '/images/logs.png'; // שם קובץ בולי העץ שלך
//       case 'fence':
//         return '/images/fence.png'; // שם קובץ הגדר שלך
//       default:
//         return '/images/placeholder.png';
//     }
//   };
//
//   const shopItems = [
//     { id: 'well', name: 'Wishing Well', price: 20, width: 80, height: 80 },
//     { id: 'carrot', name: 'Carrot', price: 10, width: 60, height: 60 },
//     { id: 'logs', name: 'Log Pile', price: 15, width: 80, height: 60 },
//     { id: 'fence', name: 'Fence', price: 25, width: 80, height: 40 }
//   ];
//
//   const buyItem = (item) => {
//     if (coins >= item.price) {
//       setCoins(coins - item.price);
//
//       // Calculate game area dimensions
//       const gameArea = gameAreaRef.current;
//       const rect = gameArea ? gameArea.getBoundingClientRect() : { width: 800, height: 600 };
//
//       // Add the item to the farm at a random position
//       const newItem = {
//         ...item,
//         id: `${item.id}-${Date.now()}`,
//         left: Math.floor(Math.random() * (rect.width - item.width * 2)) + item.width,
//         top: Math.floor(Math.random() * (rect.height / 2)) + (rect.height / 3),
//       };
//       setPlacedItems([...placedItems, newItem]);
//       setProgress(Math.min(100, progress + 5));
//
//       // Close shop after purchase
//       setShowShop(false);
//     }
//   };
//
//   const handleMouseDown = (e, index) => {
//     e.preventDefault();
//     const item = placedItems[index];
//
//     // Calculate the offset of the mouse from the item's top-left corner
//     const rect = e.currentTarget.getBoundingClientRect();
//     const offsetX = e.clientX - rect.left;
//     const offsetY = e.clientY - rect.top;
//
//     setDragOffset({ x: offsetX, y: offsetY });
//     setDraggingIndex(index);
//   };
//
//   const handleMouseMove = (e) => {
//     if (draggingIndex === null) return;
//
//     e.preventDefault();
//     const gameArea = gameAreaRef.current;
//     if (!gameArea) return;
//
//     const gameRect = gameArea.getBoundingClientRect();
//     const item = placedItems[draggingIndex];
//
//     // Calculate new position, taking the offset into account
//     const newLeft = e.clientX - gameRect.left - dragOffset.x;
//     const newTop = e.clientY - gameRect.top - dragOffset.y;
//
//     // Make sure item stays within bounds
//     const boundedLeft = Math.max(0, Math.min(gameRect.width - item.width, newLeft));
//     const boundedTop = Math.max(0, Math.min(gameRect.height - item.height, newTop));
//
//     // Update the item position
//     const updatedItems = [...placedItems];
//     updatedItems[draggingIndex] = { ...item, left: boundedLeft, top: boundedTop };
//     setPlacedItems(updatedItems);
//   };
//
//   const handleMouseUp = () => {
//     setDraggingIndex(null);
//   };
//
//   // Add and remove event listeners for dragging
//   useEffect(() => {
//     if (draggingIndex !== null) {
//       window.addEventListener('mousemove', handleMouseMove);
//       window.addEventListener('mouseup', handleMouseUp);
//
//       return () => {
//         window.removeEventListener('mousemove', handleMouseMove);
//         window.removeEventListener('mouseup', handleMouseUp);
//       };
//     }
//   }, [draggingIndex]);
//
//   return (
//     <div
//       ref={gameAreaRef}
//       className="relative w-full h-screen overflow-hidden cursor-default"
//       style={{
//         touchAction: draggingIndex !== null ? 'none' : 'auto',
//         cursor: draggingIndex !== null ? 'grabbing' : 'default'
//       }}
//     >
//       {/* Farm background */}
//       <div
//         className="absolute inset-0 bg-cover bg-center"
//         style={{
//           backgroundImage: "url('/images/background.png')",
//           backgroundSize: 'cover'
//         }}
//       ></div>
//
//       {/* Placed purchased items */}
//       {placedItems.map((item, index) => (
//         <div
//           key={item.id}
//           className={`absolute z-10 ${draggingIndex === index ? 'cursor-grabbing' : 'cursor-grab'}`}
//           style={{
//             left: `${item.left}px`,
//             top: `${item.top}px`,
//             width: `${item.width}px`,
//             height: `${item.height}px`,
//             backgroundImage: `url(${getImageUrl(item.id.split('-')[0])})`,
//             backgroundSize: 'contain',
//             backgroundPosition: 'center',
//             backgroundRepeat: 'no-repeat'
//           }}
//           onMouseDown={(e) => handleMouseDown(e, index)}
//           onTouchStart={(e) => {
//             const touch = e.touches[0];
//             handleMouseDown({
//               preventDefault: () => e.preventDefault(),
//               currentTarget: e.currentTarget,
//               clientX: touch.clientX,
//               clientY: touch.clientY
//             }, index);
//           }}
//         />
//       ))}
//
//       {/* UI Overlay */}
//       <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-start">
//         {/* Progress and coins */}
//         <div className="bg-white bg-opacity-80 rounded-lg p-3 shadow-lg">
//           <div className="mb-2">
//             <div className="text-sm font-bold mb-1">Progress</div>
//             <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-green-500"
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//           </div>
//           <div className="flex items-center">
//             <div className="w-5 h-5 bg-yellow-400 rounded-full mr-2"></div>
//             <div className="font-bold">{coins}</div>
//           </div>
//         </div>
//
//         {/* Buttons */}
//         <div className="space-y-3">
//           <button
//             onClick={() => setShowMissions(true)}
//             className="flex flex-col items-center bg-white bg-opacity-80 rounded-lg p-3 shadow-lg"
//           >
//             <Award size={24} className="text-blue-500" />
//             <div className="text-xs mt-1">Missions</div>
//           </button>
//
//           <button
//             onClick={() => setShowShop(true)}
//             className="flex flex-col items-center bg-white bg-opacity-80 rounded-lg p-3 shadow-lg"
//           >
//             <ShoppingBag size={24} className="text-green-500" />
//             <div className="text-xs mt-1">Shop</div>
//           </button>
//         </div>
//       </div>
//
//       {/* Missions Popup */}
//       {showMissions && (
//         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-xl p-6 max-w-md mx-4">
//             <h2 className="text-xl font-bold mb-4 text-center">Missions</h2>
//             <p className="text-center mb-6" dir="rtl">קדימה מתחילים לצבור מטבעות. מוכן למשימה שלך?</p>
//             <div className="flex justify-center">
//               <button
//                 onClick={() => {
//                   setShowMissions(false);
//                   setCoins(coins + 10);
//                   setProgress(Math.min(100, progress + 5));
//                 }}
//                 className="bg-green-500 text-white font-bold py-2 px-6 rounded-full"
//               >
//                 Ready!
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//
//       {/* Shop Popup */}
//       {showShop && (
//         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">Shop</h2>
//               <button
//                 onClick={() => setShowShop(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 Close
//               </button>
//             </div>
//
//             <div className="grid grid-cols-2 gap-4">
//               {shopItems.map((item) => (
//                 <div key={item.id} className="border rounded-lg p-3 flex flex-col items-center">
//                   <div
//                     className="w-16 h-16 bg-center bg-no-repeat bg-contain mb-2"
//                     style={{ backgroundImage: `url(${getImageUrl(item.id)})` }}
//                   ></div>
//                   <div className="font-bold">{item.name}</div>
//                   <div className="flex items-center my-2">
//                     <div className="w-4 h-4 bg-yellow-400 rounded-full mr-1"></div>
//                     <div>{item.price}</div>
//                   </div>
//                   <button
//                     onClick={() => buyItem(item)}
//                     disabled={coins < item.price}
//                     className={`px-4 py-1 rounded-full text-sm font-bold ${
//                       coins >= item.price
//                         ? 'bg-green-500 text-white'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                   >
//                     Buy
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default ExGame;