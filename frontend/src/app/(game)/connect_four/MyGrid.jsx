import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MyGrid = () => {
    const [circleColor, setCircleColor] = useState(Array(42).fill('#1C4E8E'));
    const [yourTurn, setYourTurn] = useState(true);
    const [winner, setWinner] = useState(null);

    function celebration(color) {
        // setCircleColor(Array(42).fill('#1C4E8E'));
        if (color !== 'draw')
            alert(`Congratulations ${color} player wins`);
        else
            alert('drawwwwwwwww');
        setWinner(null);
    }

    useEffect(() => {
        if (winner) {
            celebration(winner);
        }
    }, [winner]);

    function checkForWinner() {
        for (let j = 0; j < 42; j += 7) {
            for (let i = j; i <= j + 3; i++) {
                if (circleColor[i] !== '#1C4E8E' 
                && circleColor[i] === circleColor[i + 1] 
                && circleColor[i] === circleColor[i + 2] 
                && circleColor[i] === circleColor[i + 3]) {
                    circleColor[i] = 'green';
                    circleColor[i +1] = 'green';
                    circleColor[i +2] = 'green';
                    circleColor[i +3] = 'green';
                    setCircleColor(circleColor);
                    setWinner(circleColor[i]);
                    console.log("win in 1")
                    return;
                }
            }
        }
        for (let j = 0; j < 21; j++) {
            if (j + 21 < 42 && circleColor[j] !== '#1C4E8E' && circleColor[j] === circleColor[j + 7] && circleColor[j] === circleColor[j + 14] && circleColor[j] === circleColor[j + 21]) {
                setWinner(circleColor[j]);
                circleColor[j] = 'green';
                circleColor[j +7] = 'green';
                circleColor[j +14] = 'green';
                circleColor[j +21] = 'green';
                setCircleColor(circleColor);

                console.log("win in 2")
                return;
            }
        }
        for (let j = 0; j < 18; j++) {
            if (j % 7 <= 3 && circleColor[j] !== '#1C4E8E' 
            && circleColor[j] === circleColor[j + 8] 
            && circleColor[j] === circleColor[j + 16] 
            && circleColor[j] === circleColor[j + 24]) {
                circleColor[j] = 'green';
                circleColor[j + 8] = 'green';
                circleColor[j + 16] = 'green';
                circleColor[j + 24] = 'green';
                setCircleColor([...circleColor]);
                setWinner(circleColor[j]);
                console.log("win in 3");
                return;
            }
        }
        for (let j = 3; j <= 20; j++) {
            if (j % 7 >= 3 && circleColor[j] !== '#1C4E8E' && circleColor[j] === circleColor[j + 6] && circleColor[j] === circleColor[j + 12] && circleColor[j] === circleColor[j + 18]) {
                setWinner(circleColor[j]);
                circleColor[j] = 'green';
                circleColor[j +6] = 'green';
                circleColor[j +12] = 'green';
                circleColor[j +24] = 'green';
                setCircleColor(circleColor);

                console.log("win in 4")
                return;
            }
        }
        if (circleColor.every(color => color !== '#1C4E8E problem in 6 (11 17 23)')) {
            setWinner('draw');
        }
    }

    const handleClick = (index) => {
        let column = index % 7;
        let row = 5;

        while (row >= 0) {
            index = row * 7 + column;
            if (circleColor[index] === '#1C4E8E') {
                const newCircleColor = [...circleColor];
                newCircleColor[index] = yourTurn ? 'red' : 'yellow';
                setCircleColor(newCircleColor);
                setYourTurn(!yourTurn);
                checkForWinner();
                return;
            }
            row--;
        }
    };

    const discVariants = {
        hidden: (custom) => ({
            y: -custom * 72,
            x: 0,
            opacity: 1,
        }),
        visible: {
            y: -1,
            x: -2,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 50,
                damping: 13,
                // bounce: 10, // Add bounce effect
            },
        },
    };

    return (
        <>
            <div className="relative">
                <div className=" absolute top-[-16px] left-[85px] pointer-events-none" style={{ zIndex: 2 }}>
                    <img src="Exclude.svg" alt="walo" className="w-full" ></img>
                </div>
                
                <div className="grid grid-cols-7 grid-rows-6 gap-[15px] max-w-[1000px]  rounded-lg mx-10 lg:mx-24" style={{ zIndex: 1 }}>
                    {Array.from({ length: 42 }).map((_, index) => (
                        <div 
                            onClick={() => handleClick(index)}
                            key={index}
                            className="w-[26px] h-[26px] md:w-16 md:h-[60px] cursor-pointer  rounded-full"
                            
                        >
                            <AnimatePresence>
                                {circleColor[index] !== '#1C4E8E' && (
                                    <motion.div
                                        key={index}
                                        custom={Math.floor(index / 7)}
                                        initial="hidden"
                                        animate="visible"
                                        variants={discVariants}
                                        style={{
                                            backgroundColor: circleColor[index],
                                            zIndex: -1, // Set zIndex dynamically
                                        }}
                                        className="w-[68px] h-[68px] rounded-full border-black"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
            <div className={`w-fit m-auto mt-4 ${yourTurn ? `bg-red-500` : 'bg-yellow-500'} `}> 
                {yourTurn ? <span>Red</span> : <span>Yellow</span>} Turn
            </div>
        </>
    );
}

export default MyGrid;

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const MyGrid = () => {
//     // ... previous state and functions remain the same ...

//     const [circleColor, setCircleColor] = useState(Array(42).fill('#1C4E8E'));
//     const [yourTurn, setYourTurn] = useState(true);
//     const [winner, setWinner] = useState(null);

//     function celebration(color) {
//         setCircleColor(Array(42).fill('#1C4E8E'));
//         alert(`Congratulations ${color} player wins`);
//         setWinner(null);
//     }

//     useEffect(() => {
//         if (winner) {
//             celebration(winner);
//         }
//     }, [winner]);

//     function checkForWinner() {
//         for (let j = 0; j < 42; j += 7) {
//             for (let i = j; i <= j + 3; i++) {
//                 if (circleColor[i] !== '#1C4E8E' 
//                 && circleColor[i] === circleColor[i + 1] 
//                 && circleColor[i] === circleColor[i + 2] 
//                 && circleColor[i] === circleColor[i + 3]) {
//                     setWinner(circleColor[i]);
//                     return;
//                 }
//             }
//         }
//         for (let j = 0; j < 21; j++) {
//             if (j + 21 < 42 && circleColor[j] !== '#1C4E8E' && circleColor[j] === circleColor[j + 7] && circleColor[j] === circleColor[j + 14] && circleColor[j] === circleColor[j + 21]) {
//                 setWinner(circleColor[j]);
//                 return;
//             }
//         }
//         for (let j = 0; j < 18; j++) {
//             if (j + 24 < 42 && circleColor[j] !== '#1C4E8E' && circleColor[j] === circleColor[j + 8] && circleColor[j] === circleColor[j + 16] && circleColor[j] === circleColor[j + 24]) {
//                 setWinner(circleColor[j]);
//                 return;
//             }
//         }
//         for (let j = 3; j <= 20; j++) {
//             if (j + 18 < 42 && circleColor[j] !== '#1C4E8E' && circleColor[j] === circleColor[j + 6] && circleColor[j] === circleColor[j + 12] && circleColor[j] === circleColor[j + 18]) {
//                 setWinner(circleColor[j]);
//                 return;
//             }
//         }
//     }

//     const handleClick = (index) => {
//         let column = index % 7;
//         let row = 5;

//         while (row >= 0) {
//             index = row * 7 + column;
//             if (circleColor[index] === '#1C4E8E') {
//                 const newCircleColor = [...circleColor];
//                 newCircleColor[index] = yourTurn ? 'red' : 'yellow';
//                 setCircleColor(newCircleColor);
//                 setYourTurn(!yourTurn);
//                 checkForWinner();
//                 return;
//             }
//             row--;
//         }
//     };

//     const discVariants = {
//         hidden: (custom) => ({
//             y: -custom * 72,
//             x: 0,
//             opacity: 1,
//         }),
//         visible: {
//             y: -1,
//             x: -2,
//             opacity: 1,
//             transition: {
//                 type: "spring",
//                 stiffness: 50,
//                 damping: 13,
//                 // bounce: 10, // Add bounce effect
//             },
//         },
//     };

    
//         return (
//             <>
//                 <div className="relative">
//                     <div className="absolute top-[-16px] lg:left-[83px] left-[35px] pointer-events-none " style={{ zIndex: 2 }}>
//                         <img src="Exclude.svg" alt="walo" className="lg:w-full w-[300px] h-[300px] lg:h-full "></img>
//                     </div>
                    
//                     <div className="grid grid-cols-7 gap-[15px] lg:mx-24 mx-10 w-[300px] h-[280px] lg:w-full lg:h-full" style={{ zIndex: 1 }}>
//                         {Array.from({ length: 42 }).map((_, index) => (
//                             <div 
//                                 key={index}
//                                 className="lg:w-16 lg:h-[60px] w-[35px] h-[35px] cursor-pointer bg-red-300 rounded-full"
//                             >
//                                 <AnimatePresence>
//                                     {circleColor[index] !== '#1C4E8E' && (
//                                         <motion.div
//                                             key={index}
//                                             custom={Math.floor(index / 7)}
//                                             initial="hidden"
//                                             animate="visible"
//                                             variants={discVariants}
//                                             style={{
//                                                 backgroundColor: circleColor[index],
//                                                 zIndex: -1,
//                                             }}
//                                             className="lg:w-16 lg:h-[60px] w-[35px] h-[35px] rounded-full border-black"
//                                         />
//                                     )}
//                                 </AnimatePresence>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//                 <div className={`w-fit m-auto mt-4 ${yourTurn ? `bg-red-500` : 'bg-yellow-500'} `}> 
//                     {yourTurn ? <span>Red</span> : <span>Yellow</span>} Turn
//                 </div>
//             </>
//         );
//     }
    
//     export default MyGrid;