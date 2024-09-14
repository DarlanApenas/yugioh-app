import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import './App.css';

const App = () => {
  const [card, setCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("pt");
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchRandomCard = async () => {
      try {
        const langParam = language ? `language=${language}&` : "";
        const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?${langParam}num=1&offset=0&sort=random&cachebust`);
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
    }

    const intervalId = setInterval(() => {
      window.location.reload();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [isLoading, language]);

  useEffect(() => {
    if (!card || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 2;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const frontTexture = new THREE.TextureLoader().load(`/images${card.card_images[0].image_url.split('https://images.ygoprodeck.com')[1]}`);
    const backTexture = new THREE.TextureLoader().load('/verso.jpg');

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
  }, [card]);

  const handleLanguageChange = () => {
    setLanguage(prevLanguage => (prevLanguage === "pt" ? "" : "pt"));
    setIsLoading(true);
  };

  return (
    <div className="app">
      {isLoading && <div className="loading">Carregando...</div>}
      <button className="language-toggle" onClick={handleLanguageChange}>
        {language === "pt" ? "EN" : "PT-BR"}
      </button>
      <div ref={containerRef} className="three-container"></div>
      {card && (
        <div className="card-info">
          <h2 className="card-name">{card.name}</h2>
          <p className="card-description">{card.desc}</p>
        </div>
      )}
    </div>
  );
};

export default App;
