import React, { useState, useEffect } from 'react';
import './App.css';

// Utility for tooltips
const Tooltip = ({ text, children }) => (
  <span className="tooltip-container">
    {children}
    <span className="tooltip-text">{text}</span>
  </span>
);

// PUBLIC_INTERFACE
function App() {
  // State for Theme & Navigation
  const [theme, setTheme] = useState('light');
  const [navPage, setNavPage] = useState('warmup');

  // Input fields for calculation
  const [rpe, setRpe] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [maxRpe, setMaxRpe] = useState('');
  const [maxResult, setMaxResult] = useState(null);

  // Results
  const [warmupSets, setWarmupSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Color scheme via CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--primary', '#0056b3');
    document.documentElement.style.setProperty('--secondary', '#e63946');
    document.documentElement.style.setProperty('--accent', '#f1c40f');
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // PUBLIC_INTERFACE: Warmup calculation
  const handleWarmupSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);
    setWarmupSets([]);
    setMaxResult(null);

    // Backend endpoint should support input: { rpe, weight, reps }
    try {
      const resp = await fetch('/api/warmup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rpe: Number(rpe),
          top_set_weight: Number(weight),
          reps: Number(reps),
        }),
      });
      if (!resp.ok) {
        throw new Error('Failed to fetch warmup sets');
      }
      const data = await resp.json();
      setWarmupSets(data.sets || []);
    } catch (err) {
      setApiError('Backend unavailable or error: ' + err.message);
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE: Max rep calculator
  const handleMaxSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);
    setWarmupSets([]);
    setMaxResult(null);
    try {
      const resp = await fetch('/api/maxrep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_weight: Number(maxWeight),
          rpe: Number(maxRpe),
        }),
      });
      if (!resp.ok) {
        throw new Error('Failed to fetch result');
      }
      const data = await resp.json();
      setMaxResult(data);
    } catch (err) {
      setApiError('Backend unavailable or error: ' + err.message);
    }
    setLoading(false);
  };

  // Layout
  return (
    <div className="App main-bg">
      <header className="nav-header">
        <span className="brand-title">Powerlifting Warm-Up Optimizer</span>
        <nav>
          <button
            className={`nav-btn ${navPage === 'warmup' ? 'active' : ''}`}
            onClick={() => setNavPage('warmup')}
          >
            Warm-Up Calculator
          </button>
          <button
            className={`nav-btn ${navPage === 'max' ? 'active' : ''}`}
            onClick={() => setNavPage('max')}
          >
            Max Rep Calculator
          </button>
        </nav>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>
      <main className="content-grid">
        <section className="input-panel">
          {navPage === 'warmup' ? (
            <>
              <h2>
                Warm-Up Set Calculator
                <Tooltip text="Enter your top set details and how many reps you'll perform.">
                  <span className="info-tip"> ⓘ </span>
                </Tooltip>
              </h2>
              <form onSubmit={handleWarmupSubmit} className="input-form">
                <label>
                  RPE
                  <Tooltip text="Rate of Perceived Exertion for your top set (6-10)">
                    <span className="info-tip">?</span>
                  </Tooltip>
                  <input
                    type="number"
                    min={6}
                    max={10}
                    step={0.5}
                    value={rpe}
                    required
                    onChange={e => setRpe(e.target.value)}
                    placeholder="e.g., 8.5"
                  />
                </label>
                <label>
                  Top Set Weight (kg)
                  <Tooltip text="The heaviest single set weight you'll lift.">
                    <span className="info-tip">?</span>
                  </Tooltip>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={weight}
                    required
                    onChange={e => setWeight(e.target.value)}
                    placeholder="e.g., 150"
                  />
                </label>
                <label>
                  Repetitions
                  <Tooltip text="Number of reps you plan for the top set.">
                    <span className="info-tip">?</span>
                  </Tooltip>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={reps}
                    required
                    onChange={e => setReps(e.target.value)}
                    placeholder="e.g., 3"
                  />
                </label>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Loading...' : 'Calculate Warm-Ups'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>
                Max Rep Calculator
                <Tooltip text="Estimate how many reps you could do at a given weight and RPE level.">
                  <span className="info-tip"> ⓘ </span>
                </Tooltip>
              </h2>
              <form onSubmit={handleMaxSubmit} className="input-form">
                <label>
                  Max Weight (kg)
                  <Tooltip text="Enter the weight you lifted.">
                    <span className="info-tip">?</span>
                  </Tooltip>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={maxWeight}
                    required
                    onChange={e => setMaxWeight(e.target.value)}
                    placeholder="e.g., 140"
                  />
                </label>
                <label>
                  RPE
                  <Tooltip text="RPE level at which you performed the lift.">
                    <span className="info-tip">?</span>
                  </Tooltip>
                  <input
                    type="number"
                    min={6}
                    max={10}
                    step={0.5}
                    value={maxRpe}
                    required
                    onChange={e => setMaxRpe(e.target.value)}
                    placeholder="e.g., 9"
                  />
                </label>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Loading...' : 'Calculate Max Reps'}
                </button>
              </form>
            </>
          )}
        </section>
        <section className="results-panel">
          <h3>Results</h3>
          {apiError && (
            <div className="error-msg">
              {apiError}
            </div>
          )}
          {navPage === 'warmup' && warmupSets && warmupSets.length > 0 && (
            <div>
              <h4>Optimal Warm-Up Sets:</h4>
              <ul className="warmup-sets-list">
                {warmupSets.map((set, idx) => (
                  <li key={idx}>
                    <span className="set-label">{set.description}</span>
                    <span className="set-detail">
                      {set.weight} kg × {set.reps} reps
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {navPage === 'max' && maxResult && (
            <div className="max-result-block">
              <h4>Estimated Max Reps:</h4>
              <div>
                {typeof maxResult.max_reps === 'number'
                  ? `You could perform approximately ${maxResult.max_reps} reps at ${maxWeight}kg and RPE ${maxRpe}.`
                  : JSON.stringify(maxResult)}
              </div>
            </div>
          )}
          {!loading && !apiError && navPage === 'warmup' && warmupSets.length === 0 &&
            <p className="hint">Enter your info and calculate for optimal warm-ups.</p>
          }
          {!loading && !apiError && navPage === 'max' && !maxResult &&
            <p className="hint">Enter lift info and RPE to estimate max reps.</p>
          }
        </section>
      </main>
      <footer className="footer">
        <span>
          Powerlifting Optimizer • <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React UI</a>
        </span>
        <span className="footer-right">
          &copy; {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}

export default App;
