import React from 'react';
import styles from './Section.module.scss';
type Props = {
  title: string;
  desc: React.ReactNode;
  children?: React.ReactNode;
};
const Section: React.FC<Props> = ({title, desc, children}) => {
  return (
    <div>
      <div className={styles.sectionWrap}>
        <div className={styles.title}>{title}</div>
        <div className={styles.desc}>{desc}</div>
      </div>
      {children}
    </div>
  );
};
export default Section;
