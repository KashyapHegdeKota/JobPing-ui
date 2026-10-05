import { BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import styles from "./Brand.module.css";

export default function Brand() {
  return <Link href="/" className={styles.brand} aria-label="JobPing home">
    <span className={styles.mark}><BriefcaseBusiness size={19} aria-hidden="true" /></span>
    <span>jobping<span className={styles.dot}>.</span></span>
  </Link>;
}
