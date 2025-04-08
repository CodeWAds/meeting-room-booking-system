import React from "react";
import styles from "../styles/NotFound.module.css";
import Link from 'next/link'

const NotFound: React.FC = () => {
  return (
    <div className={styles.container}>
        <img src="/svg/not-found.svg" alt="Not Found" />
      <h1 className={styles.title}>404</h1>
      <p className={styles.text}>ОЙ! Ошибочка вышла, 
страница которую 
Вы ищете не найдена(</p>
      <Link href="/"><button className={styles.button}>На главную</button></Link>
    </div>
  );
};

export default NotFound;