import styles from './HamburguerIcon.module.css';

interface HamburguerIconProps {
  isSelected: boolean;
  handleClick: () => void;
}

const HamburguerIcon = ({ isSelected, handleClick }: HamburguerIconProps) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='relative h-8 w-10 cursor-pointer' onClick={handleClick}>
        <div
          className={`absolute h-[2px] w-10 rounded-sm bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] ${
            styles.line
          } ${isSelected ? styles['line1-selected'] : styles.line1}`}
        ></div>
        <div
          className={`absolute h-[2px] w-10 rounded-sm bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] ${
            styles.line
          } ${isSelected ? styles['line2-selected'] : styles.line2}`}
        ></div>
        <div
          className={`absolute h-[2px] w-10 rounded-sm bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] ${
            styles.line
          } ${isSelected ? styles['line3-selected'] : styles.line3}`}
        ></div>
      </div>
    </div>
  );
};

export default HamburguerIcon;
