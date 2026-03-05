import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>       
        <div className={styles.intro}>
          <h1>I'm Rahul Anand</h1>
          <p>
            Looking for a starting point or more instructions? Head over to{" "}
          </p>
        </div>
      </main>
    </div>
  );
}
