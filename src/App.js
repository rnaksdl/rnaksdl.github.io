// ... (Import statements and other code remain the same)

// Add your background image paths
const backgroundImage1 = 'path/to/your/image1.jpg';
const backgroundImage2 = 'path/to/your/image2.jpg';

function App() {
  // ... (Existing code remains the same)
  
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
          <section id="section1" style={{ backgroundImage: `url(${backgroundImage1})` }}>
            {/* Main content */}
          </section>
          <section id="section2" style={{ backgroundImage: `url(${backgroundImage2})` }}>
            {facts.map((fact, index) => (
              <div className={`fact fact-${index % 5}`} key={index}>
                {fact}
              </div>
            ))}
          </section>
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
