import { useState, useEffect } from "react";

function useTypewriter(text, speed = 12) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayed("");
    if (!text) return;

    const interval = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

export default useTypewriter;
