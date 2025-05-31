import { useState, useEffect } from 'react';
import Input from '../../components/ui/new/Input';
import {
  IoArrowDownOutline,
  IoArrowUpOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoSearch,
  IoStar,
} from 'react-icons/io5';
import Button from '../../components/ui/new/Button';
import { BiSortAlt2 } from 'react-icons/bi';
import { LuListFilter } from 'react-icons/lu';
import ReviewCard from '../../components/dashboard/cards/ReviewCard';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import ReviewsSkeleton from '@/components/dashboard/skeleton/ReviewsSkeleton';
import { formatDateToSpanishLocale } from '@/utils/date';
import ClickOutside from '@/components/ui/ClickOutside';
import { IoIosTrendingUp } from 'react-icons/io';
import type { ImprovementValue, Review } from '@/types/reviews';

type ActionType = 'date' | 'calification' | 'typeImprovement' | 'employee';

type OrderByDirection = 'asc' | 'desc';

interface OrderBy {
  open: boolean;
  type: ActionType;
  direction: OrderByDirection;
}

type filterType = '>' | '>=' | '<' | '<=' | '=' | '!=';

interface DateFilter {
  filter: filterType;
  date1?: string;
  date2?: string;
  date?: string;
}

interface CalificationFilter {
  filter: filterType;
  calification: number;
}

interface TypeImprovementFilter {
  filter: ImprovementValue[];
}

interface EmployeeFilter {
  filter: string[];
}

interface Filter {
  type: ActionType;
  value:
    | DateFilter
    | CalificationFilter
    | TypeImprovementFilter
    | EmployeeFilter;
}

interface FilterType {
  open: boolean;
  filters: Filter[];
}

const orderByOptions = [
  {
    label: 'Fecha',
    value: 'date',
    icon: <IoCalendarOutline className='h-4 w-4' />,
  },
  {
    label: 'Calificación',
    value: 'calification',
    icon: <IoStar className='h-4 w-4' />,
  },
  {
    label: 'Tipo de mejora',
    value: 'typeImprovement',
    icon: <IoIosTrendingUp className='h-4 w-4' />,
  },
  {
    label: 'Empleado',
    value: 'employee',
    icon: <IoPersonOutline className='h-4 w-4' />,
  },
];

export function ReviewsContent() {
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState<OrderBy>({
    open: false,
    type: 'date',
    direction: 'desc',
  });
  const [filter, setFilter] = useState<FilterType>({
    open: false,
    filters: [],
  });
  const { selectedRestaurant, reviews, fetchReviews, isLoading } =
    useRestaurantStore();

  useEffect(() => {
    if (selectedRestaurant) {
      fetchReviews();
    }
  }, [selectedRestaurant, fetchReviews]);

  if (isLoading) {
    return <ReviewsSkeleton />;
  }

  const getReviewsBySearch = () => {
    if (!search.trim()) return reviews;

    const searchTerm = search.toLowerCase().trim();

    return reviews.filter((review) => {
      // Search in comment
      if (review.comment?.toLowerCase().includes(searchTerm)) return true;

      // Search in email
      if (review.email?.toLowerCase().includes(searchTerm)) return true;

      // Search in typeImprovement
      if (review.typeImprovement?.toLowerCase().includes(searchTerm))
        return true;

      // Search in date (both createdAt and date fields)
      const formattedCreatedAt = formatDateToSpanishLocale(review.createdAt);
      const formattedDate = formatDateToSpanishLocale(review.date);
      if (
        formattedCreatedAt.toLowerCase().includes(searchTerm) ||
        formattedDate.toLowerCase().includes(searchTerm)
      )
        return true;

      // Search in rating (if user types a number)
      if (
        !isNaN(Number(searchTerm)) &&
        review.calification === Number(searchTerm)
      )
        return true;

      // Search in employee name if exists
      if (
        review.employee?.firstName?.toLowerCase().includes(searchTerm) ||
        review.employee?.lastName?.toLowerCase().includes(searchTerm)
      )
        return true;

      return false;
    });
  };

  const handleOrderByClick = () => {
    setOrderBy({
      open: !orderBy.open,
      type: orderBy.type,
      direction: orderBy.direction,
    });
    setFilter((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleFilterClick = () => {
    setFilter({
      open: !filter.open,
      filters: filter.filters,
    });
    setOrderBy((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleOrderBy = (type: ActionType, direction: OrderByDirection) => {
    setOrderBy((prev) => ({
      ...prev,
      type,
      direction,
    }));
  };

  const getOrderedReviews = (reviews: Review[]) => {
    const sorted = [...reviews];
    sorted.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (orderBy.type) {
        case 'date':
          // Use createdAt or date, parse as Date
          aValue = new Date(a.createdAt || a.date);
          bValue = new Date(b.createdAt || b.date);
          break;
        case 'calification':
          aValue = a.calification;
          bValue = b.calification;
          break;
        case 'typeImprovement':
          aValue = a.typeImprovement || '';
          bValue = b.typeImprovement || '';
          break;
        case 'employee':
          aValue = (a.employee?.firstName || '') + (a.employee?.lastName || '');
          bValue = (b.employee?.firstName || '') + (b.employee?.lastName || '');
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (orderBy.direction === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
    return sorted;
  };

  const searchedReviews = getReviewsBySearch();
  const orderedReviews = getOrderedReviews(searchedReviews);

  return (
    <div className='w-full flex flex-col gap-4 md:gap-8'>
      <div className='w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8'>
        <Input
          placeholder='Buscar reseña'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<IoSearch className='h-4 w-4' />}
          className='w-full'
        />
        <div className='flex items-center gap-8 w-full md:w-auto relative'>
          <ClickOutside
            onClickOutside={() =>
              setOrderBy((prev) => ({ ...prev, open: false }))
            }
            className='relative'
            isOpen={orderBy.open}
          >
            <Button
              label='Ordenar'
              onClick={handleOrderByClick}
              icon={<BiSortAlt2 className='h-4 w-4' />}
              className={`w-full md:w-auto ${
                orderBy.open ? 'bg-white/20' : ''
              }`}
            />
            {orderBy.open && (
              <div className='absolute top-[calc(100%+0.5rem)] right-0  border border-white/20 bg-white/10 backdrop-blur-lg rounded-lg p-4 flex flex-col gap-2'>
                {orderByOptions.map((option) => (
                  <div
                    className='flex justify-between items-center gap-2'
                    key={option.value}
                  >
                    <div className='flex gap-2 items-center text-nowrap'>
                      {option.icon}
                      {option.label}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        label=''
                        onClick={() =>
                          handleOrderBy(option.value as ActionType, 'asc')
                        }
                        className={
                          orderBy.type.toString() === option.value &&
                          orderBy.direction.toString() === 'asc'
                            ? '!bg-green text-primary-dark border border-primary-dark'
                            : ''
                        }
                        icon={<IoArrowUpOutline className='h-4 w-4' />}
                      />
                      <Button
                        label=''
                        onClick={() =>
                          handleOrderBy(option.value as ActionType, 'desc')
                        }
                        className={
                          orderBy.type.toString() === option.value &&
                          orderBy.direction.toString() === 'desc'
                            ? '!bg-green text-primary-dark border border-primary-dark'
                            : ''
                        }
                        icon={<IoArrowDownOutline className='h-4 w-4' />}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ClickOutside>
          <ClickOutside
            onClickOutside={() => {
              setFilter((prev) => ({ ...prev, open: false }));
            }}
            className='relative'
            isOpen={filter.open}
          >
            <Button
              label='Filtrar'
              onClick={handleFilterClick}
              icon={<LuListFilter className='h-4 w-4' />}
              className={`w-full md:w-auto ${filter.open ? 'bg-white/20' : ''}`}
            />
            {filter.open && (
              <div className='absolute top-[calc(100%+0.5rem)] right-0  border border-white/20 bg-white/10 backdrop-blur-lg rounded-lg p-4 flex flex-col gap-2'>
                hello
              </div>
            )}
          </ClickOutside>
        </div>
      </div>
      <div className='max-h-[calc(100dvh-20.5rem)] border-t border-white/20 pt-4 md:max-h-[calc(100dvh-14rem)] overflow-y-scroll overflow-x-hidden scrollbar-hide md:px-4 flex flex-col gap-4'>
        {orderedReviews.length > 0 ? (
          orderedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div className='text-white'>
            {search
              ? 'No se encontraron reseñas que coincidan con la búsqueda.'
              : 'No hay reseñas disponibles.'}
          </div>
        )}
      </div>
    </div>
  );
}
