import React from 'react';
import styles from './Section.module.scss';
type Props = {
  title: string;
  desc: string;
  note?: string;
  children?: React.ReactNode;
};
const Section: React.FC<Props> = ({title, desc, note, children}) => {
  return (
    <div>
      <div className={styles.sectionWrap}>
        <div className={styles.title}>{title}</div>
        <div className={styles.desc}>{desc}</div>
      </div>
      {children}
      {note && <div className={styles.note}>{note}</div>}
    </div>
  );
};
export default Section;
