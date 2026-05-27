// Main mount — Apple-keynote-style promo for StudIQ.

function App() {
  // Re-mount Stage on 'studiq-start' so audio + visuals sync.
  const [key, setKey] = React.useState(0);
  React.useEffect(() => {
    const h = () => setKey(k => k + 1);
    window.addEventListener('studiq-start', h);
    return () => window.removeEventListener('studiq-start', h);
  }, []);

  return (
    <Stage
      key={key}
      width={1920}
      height={1080}
      duration={32}
      background="#000"
      persistKey="studiq-promo"
      loop={true}
      autoplay={true}
    >
      <Vignette />
      <SceneColdOpen   start={0.0}  end={3.6} />
      <SceneIntroducing start={3.4} end={6.6} />
      <SceneHero       start={6.4}  end={10.6} />
      <SceneNeuralMap  start={10.4} end={15.6} />
      <ScenePapers     start={15.4} end={20.4} />
      <SceneSpok       start={20.2} end={24.6} />
      <SceneCascade    start={24.4} end={28.4} />
      <SceneFinale     start={28.2} end={32.0} />
      <FilmGrain />
    </Stage>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
