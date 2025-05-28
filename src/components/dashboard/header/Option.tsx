import { Users2 } from 'lucide-react';
import { GrLocation } from 'react-icons/gr';
import { CgArrowsExchange } from 'react-icons/cg';
import { LuBuilding2 } from 'react-icons/lu';
import Chip from './Chip';

interface Props {
  onClick: () => void;
  isCollapsed: boolean;
  openHeader: boolean;
  restaurantName: string;
  location?: string;
  employeesAmount: number;
  isOption?: boolean;
  selected?: boolean;
  className?: string;
}

export default function Option({
  onClick,
  isCollapsed,
  openHeader,
  restaurantName,
  location,
  employeesAmount,
  isOption = false,
  selected = false,
  className,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={`${className} w-full h-20 flex items-center rounded-lg justify-between px-4 py-2 cursor-pointer ${
        isOption
          ? selected
            ? 'border-green border bg-primary-light'
            : ' bg-primary-light'
          : ''
      }`}
    >
      <div className='w-full h-full flex gap-4 items-center'>
        <div className='flex gap-2 items-center'>
          <LuBuilding2
            className='h-8 w-8'
            color={selected ? 'var(--green)' : 'white'}
          />

          <div
            className={`flex flex-col items-start justify-center gap-1 ml-2 ${
              selected ? 'text-green' : 'text-white'
            }`}
          >
            <h3 className='text-2xl font-bold'>{restaurantName}</h3>
            <div className='flex items-center gap-1'>
              <GrLocation className='h-4 w-4' />
              <p className='text-base'>{location ?? 'Sin ubicación'}</p>
            </div>
          </div>
        </div>
        <div className='px-4 border-l border-white/20 h-full flex items-center gap-2 text-white/50'>
          <Users2 className='h-4 w-4' />
          <p className='text-base'>
            {employeesAmount} {employeesAmount > 0 ? 'empleados' : 'empleado'}
          </p>
        </div>
      </div>
      {isOption ? (
        <Chip
          isSelected={selected}
          label={selected ? 'Seleccionado' : 'Seleccionar'}
        />
      ) : (
        <span className='flex items-center gap-2'>
          <CgArrowsExchange
            className={`h-6 w-6 transition-all duration-300 ${
              openHeader ? 'rotate-y-180' : ''
            }`}
          />
          <p className='text-white/50 text-base text-nowrap'>
            Cambiar restaurante
          </p>
        </span>
      )}
    </div>
  );
}
