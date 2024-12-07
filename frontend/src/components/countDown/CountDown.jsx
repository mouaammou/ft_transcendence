import { useState, useEffect } from 'react';

const CountdownTimer = ({ className="w-fit h-auto" }) => {
  const [seconds, setSeconds] = useState(8 * 60);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds(seconds => seconds - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      setSeconds(8 * 60);
    }
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className={className}>
      {minutes}:{remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}
    </div>
  );
};

export default CountdownTimer;
