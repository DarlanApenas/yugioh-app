import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import './App.css';

const App = () => {
  const [card, setCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verso, setVerso] = useState('/verso.jpg');
  const [showPopup, setShowPopup] = useState(false);
  const [gifUrl, setGifUrl] = useState('');
  const containerRef = useRef(null);
  const cardMeshRef = useRef(null);

  useEffect(() => {
    const fetchRandomCard = async () => {
      try {
        const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?num=1&offset=0&sort=random&cachebust`);
        const data = await response.json();
        setCard(data.data[0]);
      } catch (error) {
        console.error('Erro ao buscar carta:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      fetchRandomCard();
      fetchRandomGif();
    }

  }, [isLoading]);

  useEffect(() => {
    if (!card || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 2;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const frontTexture = new THREE.TextureLoader().load(`/images${card.card_images[0].image_url.split('https://images.ygoprodeck.com')[1]}`);
    const backTexture = new THREE.TextureLoader().load(`${verso}`);

    const geometry = new THREE.BoxGeometry(1, 1.4, 0.00);

    const materials = [
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial({ map: backTexture }),
      new THREE.MeshBasicMaterial({ map: frontTexture })
    ];

    const cardMesh = new THREE.Mesh(geometry, materials);
    scene.add(cardMesh);

    cardMesh.scale.set(1.2, 1.2, 1);
    cardMeshRef.current = cardMesh;

    const animate = () => {
      requestAnimationFrame(animate);
      cardMesh.rotation.y += 0.009;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current.removeChild(renderer.domElement);
    };
  }, [card, verso]);

  const handleVerso = () => {
    const newVerso = verso === '/verso-2.png' ? '/verso.jpg' : '/verso-2.png';
    setVerso(newVerso);

    if (cardMeshRef.current) {
      const newBackTexture = new THREE.TextureLoader().load(newVerso);
      cardMeshRef.current.material[4].map = newBackTexture;
      cardMeshRef.current.material[4].needsUpdate = true;
    }
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const fetchRandomGif = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/random-gif');
      const data = await response.json();
      setGifUrl(data.gif_url);
      console.log(data.gif_url);
    } catch (error) {
      console.error('Error fetching the GIF:', error);
    }
  };

  useEffect(() => {
    if (gifUrl) {
      document.body.style.backgroundImage = `url(${gifUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    }
    return () => {
      document.body.style.backgroundImage = '';
    };
  }, [gifUrl]);

  return (
    <div className="app">
      {isLoading && <div className="loading">Carregando</div>}
      <button className="verso-toggle" title="altere o verso" id="btn-all" onClick={handleVerso}>
        Verso
      </button>
      <div ref={containerRef} className="three-container"></div>
      {card && (
        <div className="card-info">
          <button className="card-name-style" onClick={togglePopup}>{card.name}</button>
        </div>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>{card.name}</h2>
            <p>{card.desc}</p>
            <button className="close-button" onClick={togglePopup}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
