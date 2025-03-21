"use client";
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import Rooms from '../components/Rooms';
import Modal from '../components/Modal';
import styles from '../styles/Home.module.css';


const Home: React.FC = () => {
  const[isModalOpen,setIsModalOpen] = useState(false);
  const handleBookClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <Filters />
      <Rooms onBookClick={handleBookClick} />
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Home;