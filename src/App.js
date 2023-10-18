import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [facts, setFacts] = useState([]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);

    const randomFacts = [
      "I love programming.",
      "I'm a coffee enthusiast.",
      "I enjoy hiking.",
      // Add more facts here
    ];
    setFacts(randomFacts);
  }, []);

  return (
    <div className={`App ${theme}`}>
      {isLoading ? (
        <div className="loader"></div>
      ) : (
        <>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            Toggle Theme
          </button>
          <header className="sticky-header">
            <h1>Kyumin Lee</h1>
          </header>
          <main>
            {facts.map((fact, index) => (
              <div className={`fact fact-${index % 5}`} key={index}>
                {fact}
              </div>
            ))}
          </main>
          <footer>
            <a href="https://www.instagram.com/rnaks.dl/" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://github.com/rnaksdl" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="mailto:scouter_roe.0b@icloud.com">
              Contact Me
            </a>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
