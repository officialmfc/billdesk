// BoyIcon.tsx
import React from 'react';
import styles from './css/typing.module.css'; // Import the CSS module

export default function Typing() {
  return (
    <div className={styles.icon}>
      <svg height="250" width="250" className={styles.bg}>
        <path
          d="m 30 70 q 24 -6 41 -30 q 20 -22 48 13 q 12 12 43 28 q 32 16 -20 45 q -18 9 -31 31 q -21 33 -49 0 q -25 -30 -40 -42 q -15 -9 -13 -22 t 14 -20 z"
          stroke="#f7faff"
          strokeWidth="2" // Changed stroke-width to strokeWidth
          fill="#f7faff"
        />
      </svg>
      <div className={styles.boy}>
        <span className={styles.boyShirt}></span>
        <svg height="150" width="150" className={styles.boyFace}>
          <path
            d="m 50 10 q 25 0 23 30 q -3 19 -23 20 q -19 -1 -22 -20 q -2 -30 22 -30"
            stroke="none"
            strokeWidth="1" // Changed stroke-width to strokeWidth
            fill="#f2daa0"
          />
        </svg>
        {/* <div className={styles.boyBadge}>
          <div className={styles.image}>
            <i className="fas fa-align-left"></i>
          </div>
        </div> */}
        <svg height="150" width="150" className={styles.boyHair}>
          <path
            d="m 50 40 q 8 0 15 -12 q 5 5 5 15 q 5 -25 -10 -30 q -10 -3 -20 0 q -14 5 -10 30 q 0 -5 3 -10 q 2 2 2 5 q 3 -1 5 -5 q 2 3 2 7 q 4 0 7 -7 q 2 3 0 7 z "
            stroke="#222"
            strokeWidth="1" // Changed stroke-width to strokeWidth
            fill="#222"
            // Removed width/height props as they are on the parent svg
          />
        </svg>
        <svg height="50" width="50" className={styles.boyHairLick1}>
          <path
            d="m 0 0 q 10 2 10 10 q 0 5 -5 10 q 3 -7 -5 -20 z"
            stroke="#222"
            strokeWidth="1" // Changed stroke-width to strokeWidth
            fill="#222"
          />
        </svg>
        <svg height="50" width="50" className={styles.boyHairLick2}>
          <path
            d="m 0 0 q 10 2 10 10 q 0 5 -5 10 q 3 -7 -5 -20 z"
            stroke="#222"
            strokeWidth="1" // Changed stroke-width to strokeWidth
            fill="#222"
          />
        </svg>
        <svg height="150" width="150" className={styles.boyHairShadow}>
          <path
            d="m 50 40 q 8 0 15 -12 q 3 4 4 15 q 5 -25 -11 -30 q -10 -3 -18 0 q -14 5 -10 30 q 0 -5 3 -10 q 2 2 2 5 q 3 -1 5 -5 q 2 3 2 7 q 4 0 7 -7 q 2 3 0 7 z "
            stroke="#d1b46d"
            strokeWidth="1" // Changed stroke-width to strokeWidth
            fill="#d1b46d"
          />
        </svg>
        <div className={styles.boyEars}>
          <span className={styles.leftEar}></span>
          <span className={styles.rightEar}></span>
        </div>
        <div className={styles.boyEyes}>
          <span className={`${styles.leftEye} ${styles.eye}`}></span>{' '}
          {/* Combined classes */}
          <span className={`${styles.rightEye} ${styles.eye}`}></span>{' '}
          {/* Combined classes */}
        </div>
        <div className={styles.boyBrows}>
          <span className={styles.leftBrow}></span>
          <span className={styles.rightBrow}></span>
        </div>
        <div className={styles.boyMouth}></div>
      </div>
      <div className={styles.palmLeft}></div>
      <div className={styles.palmRight}></div>
      <ul className={styles.fingersLeft}>
        <li className={styles.li}></li>
        <li className={styles.li}></li>
        <li className={styles.li}></li>
        <li className={styles.li}></li>
        <li className={styles.li}></li>
      </ul>
      <ul className={styles.fingersRight}>
        <li className={styles.li}></li>
        <li className={styles.li}></li>
        <li className={styles.li}></li>
        <li className={styles.li}></li>
        <li className={styles.li}></li>
      </ul>
      <div className={styles.keyboard}>
        <span className={styles.key}></span>
        <span className={styles.key}></span>
        <span className={styles.key}></span>
        <span className={styles.key}></span>
        <span className={styles.key}></span>
        <span className={styles.key}></span>
        <span className={styles.key}></span>
        <span className={styles.key}></span>
        <span className={styles.key}></span>
      </div>
    </div>
  );
}
