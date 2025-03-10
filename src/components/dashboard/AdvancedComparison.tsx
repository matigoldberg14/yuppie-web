// src/components/dashboard/AdvancedComparison.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Map,
  Users,
  Star,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Share2,
  Search,
  MapPin,
  BarChart3,
  Check,
  MessageSquare,
  Calendar,
  Award,
  RefreshCw,
  Ban,
  Eye,
  Clock,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  getSelectedRestaurant,
  getCompareRestaurants,
} from '../../lib/restaurantStore';
import {
  getRestaurantReviews,
  getEmployeesByRestaurant,
} from '../../services/api';
import { useToast } from '../ui/use-toast';
import { getRestaurantInsights } from '../../services/insightsService';
import type { Employee } from '../../types/employee';
import type { Review } from '../../types/reviews';
import type { RestaurantMetrics } from '../../types/metrics';

export interface Restaurant {
  id: number;
  documentId: string;
  name: string;
  taps: string;
  owner: {
    firstName: string;
    lastName: string;
  };
}

interface AdvancedComparisonProps {
  restaurants: Restaurant[];
}

// Colors for the charts
const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#0088FE',
  '#00C49F',
];

// Cities mapping for demo purposes
// This simulates geolocation data that would come from a real API
const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];

const getCiudad = (restaurantId: number) => {
  return CITIES[restaurantId % CITIES.length];
};

const AdvancedComparison: React.FC<AdvancedComparisonProps> = ({
  restaurants,
}) => {
  const [selectedLocales, setSelectedLocales] = useState<number[]>([]);
  const [timeRange, setTimeRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [localesFiltrados, setLocalesFiltrados] =
    useState<Restaurant[]>(restaurants);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null
  );
  const [compareRestaurants, setCompareRestaurants] = useState<Restaurant[]>(
    []
  );
  const [restaurantMetrics, setRestaurantMetrics] = useState<
    Record<string, RestaurantMetrics>
  >({});
  const [allReviews, setAllReviews] = useState<Record<string, Review[]>>({});
  const [allEmployees, setAllEmployees] = useState<Record<string, Employee[]>>(
    {}
  );
  const [topEmployeesOverall, setTopEmployeesOverall] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const [lastInsightUpdate, setLastInsightUpdate] = useState<string | null>(
    null
  );
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightTimeRange, setInsightTimeRange] = useState('month');
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<any[]>([]);
  const [comparativeTab, setComparativeTab] = useState('overview');
  const { toast } = useToast();

  // Load initial state and listen for changes
  useEffect(() => {
    // Load initial state
    const loadInitialState = () => {
      const selected = getSelectedRestaurant();
      const comparisonList = getCompareRestaurants();

      setCurrentRestaurant(selected);
      setCompareRestaurants(comparisonList);

      // Set up list of selected based on main restaurant and comparison list
      const ids: number[] = [];
      if (selected) ids.push(selected.id);
      comparisonList.forEach((r) => {
        if (!ids.includes(r.id)) ids.push(r.id);
      });

      setSelectedLocales(ids);
      loadRestaurantMetrics(ids);
    };

    loadInitialState();

    // Listen for changes in state
    const handleSelectedChange = (e: CustomEvent) => {
      setCurrentRestaurant(e.detail);
      loadInitialState(); // Reload all selected IDs
    };

    const handleCompareChange = (e: CustomEvent) => {
      setCompareRestaurants(e.detail);
      loadInitialState(); // Reload all selected IDs
    };

    window.addEventListener(
      'restaurantChange',
      handleSelectedChange as EventListener
    );
    window.addEventListener(
      'compareRestaurantsChange',
      handleCompareChange as EventListener
    );

    // Load saved insights
    const savedInsights = localStorage.getItem('restaurantInsights');
    const savedDate = localStorage.getItem('insightsLastUpdate');

    if (savedInsights) {
      setInsights(JSON.parse(savedInsights));
    }

    if (savedDate) {
      setLastInsightUpdate(savedDate);
    }

    return () => {
      window.removeEventListener(
        'restaurantChange',
        handleSelectedChange as EventListener
      );
      window.removeEventListener(
        'compareRestaurantsChange',
        handleCompareChange as EventListener
      );
    };
  }, []);

  // Period in days
  const getPeriodDays = (period: string): number => {
    switch (period) {
      case 'day':
        return 1;
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'year':
        return 365;
      default:
        return 30;
    }
  };

  // Filter reviews by period
  const filterReviewsByPeriod = (
    reviews: Review[],
    period: string
  ): Review[] => {
    const periodDays = getPeriodDays(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    return reviews.filter((review) => new Date(review.createdAt) >= cutoffDate);
  };

  // Load real restaurant metrics
  const loadRestaurantMetrics = async (selectedIds: number[]) => {
    setLoading(true);

    const selectedRestaurants = restaurants.filter((r) =>
      selectedIds.includes(r.id)
    );
    const metricsData: Record<string, RestaurantMetrics> = {};
    const reviewsData: Record<string, Review[]> = {};
    const employeesData: Record<string, Employee[]> = {};
    const allEmployeesList: any[] = [];

    try {
      // For each restaurant, load its metrics
      for (const restaurant of selectedRestaurants) {
        // Get reviews
        const reviews = await getRestaurantReviews(restaurant.documentId);
        reviewsData[restaurant.documentId] = reviews;

        // Get employees
        const employees = await getEmployeesByRestaurant(restaurant.documentId);

        // Calculate metrics per employee
        const enrichedEmployees = employees.map((employee: Employee) => {
          const employeeReviews = reviews.filter(
            (review: Review) =>
              review.employee?.documentId === employee.documentId
          );

          const reviewCount = employeeReviews.length;
          const totalRating = employeeReviews.reduce(
            (sum: number, review: Review) => sum + review.calification,
            0
          );
          const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

          return {
            ...employee,
            reviewCount,
            averageRating,
          };
        });

        employeesData[restaurant.documentId] = enrichedEmployees;

        // Add employees to global list for comparison
        enrichedEmployees.forEach((emp: any) => {
          allEmployeesList.push({
            ...emp,
            // Add restaurant to name for identification
            firstName: `${emp.firstName} (${restaurant.name})`,
          });
        });

        // Calculate metrics for different periods
        const dayReviews = filterReviewsByPeriod(reviews, 'day');
        const weekReviews = filterReviewsByPeriod(reviews, 'week');
        const monthReviews = filterReviewsByPeriod(reviews, 'month');
        const yearReviews = filterReviewsByPeriod(reviews, 'year');

        // Calculate averages by period
        const getDayRating =
          dayReviews.length > 0
            ? dayReviews.reduce(
                (sum: number, r: Review) => sum + r.calification,
                0
              ) / dayReviews.length
            : 0;

        const getWeekRating =
          weekReviews.length > 0
            ? weekReviews.reduce(
                (sum: number, r: Review) => sum + r.calification,
                0
              ) / weekReviews.length
            : 0;

        const getMonthRating =
          monthReviews.length > 0
            ? monthReviews.reduce(
                (sum: number, r: Review) => sum + r.calification,
                0
              ) / monthReviews.length
            : 0;

        const getYearRating =
          yearReviews.length > 0
            ? yearReviews.reduce(
                (sum: number, r: Review) => sum + r.calification,
                0
              ) / yearReviews.length
            : 0;

        // Calculate general metrics
        const totalReviews = reviews.length;
        const averageRating =
          totalReviews > 0
            ? reviews.reduce(
                (sum: number, review: Review) => sum + review.calification,
                0
              ) / totalReviews
            : 0;

        const positiveReviews = reviews.filter(
          (review: Review) => review.calification >= 4
        ).length;

        const positiveReviewsPercent =
          totalReviews > 0 ? (positiveReviews / totalReviews) * 100 : 0;

        const employeeCount = employees.length;
        const totalTaps = parseInt(restaurant.taps || '0');
        const conversionRate =
          totalTaps > 0 ? (totalReviews / totalTaps) * 100 : 0;

        // Get top employees
        const topEmployees = enrichedEmployees
          .filter((emp: any) => emp.reviewCount && emp.reviewCount > 0)
          .sort(
            (a: any, b: any) => (b.averageRating || 0) - (a.averageRating || 0)
          )
          .slice(0, 3)
          .map((emp: any) => ({
            id: emp.documentId,
            name: `${emp.firstName} ${emp.lastName}`,
            position: emp.position,
            rating: emp.averageRating || 0,
            reviews: emp.reviewCount || 0,
          }));

        metricsData[restaurant.documentId] = {
          documentId: restaurant.documentId,
          name: restaurant.name,
          totalReviews,
          averageRating,
          employeeCount,
          totalTaps,
          conversionRate,
          positiveReviewsPercent,
          reviewsByPeriod: {
            day: dayReviews.length,
            week: weekReviews.length,
            month: monthReviews.length,
            year: yearReviews.length,
          },
          ratingByPeriod: {
            day: getDayRating,
            week: getWeekRating,
            month: getMonthRating,
            year: getYearRating,
          },
          topEmployees,
        };
      }

      // Sort top employees overall
      const sortedEmployees = allEmployeesList
        .filter((emp) => emp.reviewCount && emp.reviewCount > 0)
        .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
        .slice(0, 10);

      setRestaurantMetrics(metricsData);
      setAllReviews(reviewsData);
      setAllEmployees(employeesData);
      setTopEmployeesOverall(sortedEmployees);

      // Calculate category distribution
      calculateCategoryDistribution(reviewsData);

      // Calculate rating distribution
      calculateRatingDistribution(reviewsData);
    } catch (error) {
      console.error('Error loading restaurant metrics:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las métricas de los restaurantes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate category distribution (typeImprovement)
  const calculateCategoryDistribution = (
    reviewsData: Record<string, Review[]>
  ) => {
    const categories: Record<string, number> = {};

    // Count occurrences of each category
    Object.values(reviewsData).forEach((reviews) => {
      reviews.forEach((review) => {
        if (review.typeImprovement) {
          if (!categories[review.typeImprovement]) {
            categories[review.typeImprovement] = 0;
          }
          categories[review.typeImprovement]++;
        }
      });
    });

    // Convert to chart format
    const distribution = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort(
        (a, b) =>
          (b.value !== undefined ? b.value : 0) -
          (a.value !== undefined ? a.value : 0)
      );

    setCategoryDistribution(distribution);
  };

  // Calculate rating distribution
  const calculateRatingDistribution = (
    reviewsData: Record<string, Review[]>
  ) => {
    const ratings: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Count occurrences of each rating
    Object.values(reviewsData).forEach((reviews) => {
      reviews.forEach((review) => {
        if (review.calification >= 1 && review.calification <= 5) {
          ratings[review.calification]++;
        }
      });
    });

    // Convert to chart format
    const distribution = Object.entries(ratings).map(([rating, count]) => ({
      name: `${rating} estrellas`,
      value: count,
      rating: parseInt(rating),
    }));

    setRatingDistribution(distribution);
  };

  // Generate data for monthly trend charts
  const generateMonthlyTrendData = () => {
    // Generate last 6 months
    const months = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        date: date,
      });
    }

    // For each restaurant, calculate reviews per month
    const trendData = months.map((monthData) => {
      const dataPoint: any = {
        month: `${monthData.month} ${monthData.year}`,
      };

      // Add data for each restaurant
      Object.entries(allReviews).forEach(([docId, reviews]) => {
        const restaurantName = restaurantMetrics[docId]?.name || 'Desconocido';

        // Filter reviews for the month
        const monthStart = new Date(monthData.date);
        monthStart.setDate(1);

        const monthEnd = new Date(monthData.date);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);

        const monthReviews = reviews.filter((review) => {
          const reviewDate = new Date(review.createdAt);
          return reviewDate >= monthStart && reviewDate <= monthEnd;
        });

        dataPoint[restaurantName] = monthReviews.length;

        // Calculate average rating if there are reviews
        if (monthReviews.length > 0) {
          const avgRating =
            monthReviews.reduce((sum, r) => sum + r.calification, 0) /
            monthReviews.length;
          dataPoint[`${restaurantName} Rating`] = parseFloat(
            avgRating.toFixed(1)
          );
        } else {
          dataPoint[`${restaurantName} Rating`] = 0;
        }
      });

      return dataPoint;
    });

    return trendData;
  };

  // Generate data for radar
  const generateRadarData = () => {
    const metrics = [
      { key: 'totalReviews', label: 'Reseñas Totales', max: 100 },
      { key: 'averageRating', label: 'Calificación', max: 5 },
      {
        key: 'positiveReviewsPercent',
        label: 'Reseñas Positivas (%)',
        max: 100,
      },
      { key: 'conversionRate', label: 'Conversión (%)', max: 100 },
      { key: 'employeeCount', label: 'Tamaño Equipo', max: 20 },
    ];

    return metrics.map((metric) => {
      const radarPoint: any = { subject: metric.label };

      // For each selected restaurant
      Object.values(restaurantMetrics)
        .filter((rm) =>
          selectedLocales.includes(
            restaurants.find((r) => r.documentId === rm.documentId)?.id || 0
          )
        )
        .forEach((restaurant) => {
          // Normalize value to a 0-100 scale for radar chart
          const value = restaurant[
            metric.key as keyof typeof restaurant
          ] as number;
          const normalizedValue = Math.min(100, (value / metric.max) * 100);
          radarPoint[restaurant.name] = normalizedValue;
        });

      return radarPoint;
    });
  };

  // Request new insights from ChatGPT for a specific period
  const requestNewInsights = async () => {
    // Check if we can update (once per week)
    const canUpdate =
      !lastInsightUpdate ||
      new Date().getTime() - new Date(lastInsightUpdate).getTime() >
        7 * 24 * 60 * 60 * 1000;

    if (!canUpdate) {
      const nextUpdateDate = new Date(
        new Date(lastInsightUpdate).getTime() + 7 * 24 * 60 * 60 * 1000
      );
      toast({
        title: 'Actualización limitada',
        description: `Los insights solo pueden actualizarse una vez por semana. Próxima actualización disponible: ${nextUpdateDate.toLocaleDateString()}`,
        variant: 'destructive',
      });
      return;
    }

    setInsightLoading(true);

    try {
      // Filter reviews by selected period
      const periodFilteredReviews: Record<string, Review[]> = {};
      Object.entries(allReviews).forEach(([docId, reviews]) => {
        periodFilteredReviews[docId] = filterReviewsByPeriod(
          reviews,
          insightTimeRange
        );
      });

      // Calculate period-specific metrics
      const periodFilteredMetrics: Record<string, RestaurantMetrics> = {};
      Object.entries(restaurantMetrics).forEach(([docId, metrics]) => {
        const reviews = periodFilteredReviews[docId] || [];
        const totalReviews = reviews.length;
        const averageRating =
          totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.calification, 0) /
              totalReviews
            : 0;
        const positiveReviews = reviews.filter(
          (review) => review.calification >= 4
        ).length;
        const positiveReviewsPercent =
          totalReviews > 0 ? (positiveReviews / totalReviews) * 100 : 0;

        // Keep the rest of metrics the same
        periodFilteredMetrics[docId] = {
          ...metrics,
          totalReviews,
          averageRating,
          positiveReviewsPercent,
        };
      });

      // Prepare data to send to insights service
      const insightData = {
        restaurants: Object.values(periodFilteredMetrics),
        timeRange: insightTimeRange,
        employeeData: allEmployees,
        reviewData: periodFilteredReviews,
      };

      // Call insights service
      const newInsights = await getRestaurantInsights(insightData);

      // Save insights
      setInsights(newInsights);
      const currentDate = new Date().toISOString();
      setLastInsightUpdate(currentDate);

      // Save to localStorage
      localStorage.setItem('restaurantInsights', JSON.stringify(newInsights));
      localStorage.setItem('insightsLastUpdate', currentDate);

      toast({
        title: 'Insights actualizados',
        description: 'Análisis de restaurantes completado con éxito',
      });
    } catch (error) {
      console.error('Error getting insights:', error);
      toast({
        title: 'Error',
        description:
          'No se pudieron generar los insights. Intente nuevamente más tarde.',
        variant: 'destructive',
      });
    } finally {
      setInsightLoading(false);
    }
  };

  // Filter restaurants by search
  useEffect(() => {
    if (searchTerm) {
      setLocalesFiltrados(
        restaurants.filter(
          (local) =>
            local.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getCiudad(local.id).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setLocalesFiltrados(restaurants);
    }
  }, [searchTerm, restaurants]);

  const localesSeleccionados = restaurants.filter((local) =>
    selectedLocales.includes(local.id)
  );

  const toggleLocalSelection = (id: number) => {
    if (selectedLocales.includes(id)) {
      setSelectedLocales(selectedLocales.filter((localId) => localId !== id));
    } else {
      setSelectedLocales([...selectedLocales, id]);
    }
  };

  {
    selectedLocales.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {restaurants
          .filter((local) => selectedLocales.includes(local.id))
          .map((local) => (
            <div
              key={local.id}
              className="flex items-center gap-1 bg-white/20 text-white px-2 py-1 rounded-full cursor-pointer"
              onClick={() => toggleLocalSelection(local.id)}
            >
              <span>{local.name}</span>
              <span className="font-bold">×</span>
            </div>
          ))}
      </div>
    );
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  const handleInsightTimeRangeChange = (value: string) => {
    setInsightTimeRange(value);
  };

  // Monthly trend data
  const monthlyTrendData = generateMonthlyTrendData();

  // Radar data for comparison
  const radarData = generateRadarData();

  // Calculate comparative metrics for table
  const getComparativeMetrics = () => {
    // Calculate general average for each metric
    const selectedMetrics = Object.values(restaurantMetrics).filter((rm) =>
      selectedLocales.includes(
        restaurants.find((r) => r.documentId === rm.documentId)?.id || 0
      )
    );

    if (selectedMetrics.length === 0) return [];

    const avgRating =
      selectedMetrics.reduce((sum, r) => sum + r.averageRating, 0) /
      selectedMetrics.length;
    const avgConversion =
      selectedMetrics.reduce((sum, r) => sum + r.conversionRate, 0) /
      selectedMetrics.length;
    const avgPositive =
      selectedMetrics.reduce((sum, r) => sum + r.positiveReviewsPercent, 0) /
      selectedMetrics.length;

    // For each restaurant, calculate the difference with the average
    return selectedMetrics.map((restaurant) => {
      const ratingDiff = restaurant.averageRating - avgRating;
      const conversionDiff = restaurant.conversionRate - avgConversion;
      const positiveDiff = restaurant.positiveReviewsPercent - avgPositive;

      // Find the complete restaurant
      const fullRestaurant = restaurants.find(
        (r) => r.documentId === restaurant.documentId
      );

      return {
        id: fullRestaurant?.id || 0,
        documentId: restaurant.documentId,
        name: restaurant.name,
        city: getCiudad(fullRestaurant?.id || 0),
        totalReviews: restaurant.totalReviews,
        averageRating: restaurant.averageRating,
        conversionRate: restaurant.conversionRate,
        positivePercent: restaurant.positiveReviewsPercent,
        employeeCount: restaurant.employeeCount,
        // Differences with average
        ratingDiff,
        conversionDiff,
        positiveDiff,
        // Better or worse than average
        ratingStatus: ratingDiff >= 0 ? 'better' : 'worse',
        conversionStatus: conversionDiff >= 0 ? 'better' : 'worse',
        positiveStatus: positiveDiff >= 0 ? 'better' : 'worse',
        // Overall rating (better in 2 or more metrics = good)
        overallStatus:
          (ratingDiff >= 0 ? 1 : 0) +
            (conversionDiff >= 0 ? 1 : 0) +
            (positiveDiff >= 0 ? 1 : 0) >=
          2
            ? 'good'
            : 'needs-improvement',
      };
    });
  };

  const comparativeMetrics = getComparativeMetrics();

  return (
    <div className="p-6 bg-gradient-to-br from-[#2F02CC] to-[#5A2FE0]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Dashboard Multi-Local
          </h1>
          <p className="text-white/80">
            Comparación y análisis de rendimiento entre locales
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="w-[120px]">
            <div className="flex gap-2 items-center">
              <span className="text-white text-sm">Período:</span>
              <select
                className="bg-white/10 border-0 text-white p-2 rounded-md"
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
              >
                <option value="day">Día</option>
                <option value="week">Semana</option>
                <option value="month">Mes</option>
                <option value="year">Año</option>
              </select>
            </div>
          </div>
          <Button
            variant="secondary"
            className="bg-white/10 border-0 text-white hover:bg-white/20"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="secondary"
            className="bg-white/10 border-0 text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Map & Restaurant Selection */}
        <Card className="bg-white/10 border-0 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Mapa de Locales</CardTitle>
            <Badge className="bg-green-500">
              {restaurants.length} Locales Activos
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="relative h-[300px] bg-white/5 rounded-lg flex items-center justify-center">
              <Map className="h-16 w-16 text-white/20" />
              <div className="absolute text-white">
                Mapa interactivo de locales
              </div>
              <div className="absolute top-4 left-4 bg-white/10 p-2 rounded-lg">
                <div className="flex items-center gap-2 text-white text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>
                    Total Reseñas:{' '}
                    {currentRestaurant
                      ? restaurantMetrics[currentRestaurant.documentId]
                          ?.totalReviews
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>
                    Rating Promedio:{' '}
                    {currentRestaurant
                      ? restaurantMetrics[
                          currentRestaurant.documentId
                        ]?.averageRating.toFixed(1)
                      : '-'}
                    /5
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>
                    Tasa de Conversión:{' '}
                    {currentRestaurant
                      ? restaurantMetrics[
                          currentRestaurant.documentId
                        ]?.conversionRate.toFixed(1)
                      : '-'}
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant selector */}
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Seleccionar Locales</CardTitle>
            <CardDescription className="text-white/60">
              Selecciona los locales que deseas comparar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Buscar local..."
                  className="pl-8 bg-white/5 border-white/10 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {localesFiltrados.map((local) => (
                  <div
                    key={local.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedLocales.includes(local.id)
                        ? 'bg-white/20'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => toggleLocalSelection(local.id)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/70" />
                      <div>
                        <div className="text-white font-medium">
                          {local.name}
                        </div>
                        <div className="text-white/60 text-xs">
                          {getCiudad(local.id)}
                        </div>
                      </div>
                    </div>
                    <div>
                      {selectedLocales.includes(local.id) ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <div className="w-4 h-4 border border-white/30 rounded-md"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="secondary"
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() =>
                  setSelectedLocales(restaurants.map((local) => local.id))
                }
              >
                Seleccionar Todos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparative metrics summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Reviews */}
        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex justify-between items-center">
              <span>Reseñas ({timeRange})</span>
              <MessageSquare className="h-5 w-5 text-blue-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-white/70 text-center py-2">Cargando...</div>
            ) : (
              <div className="space-y-3">
                {localesSeleccionados.map((local, index) => {
                  const metrics = restaurantMetrics[local.documentId];
                  if (!metrics) return null;

                  // Get review count for selected period
                  const periodReviewCount =
                    metrics.reviewsByPeriod[
                      timeRange as keyof typeof metrics.reviewsByPeriod
                    ] || 0;

                  return (
                    <div key={local.id} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                          <span className="text-white text-sm">
                            {local.name}
                          </span>
                        </div>
                        <div className="text-white font-bold">
                          {periodReviewCount}
                        </div>
                      </div>
                      <Progress
                        value={periodReviewCount}
                        max={
                          Math.max(
                            ...Object.values(restaurantMetrics).map(
                              (m) =>
                                m.reviewsByPeriod[
                                  timeRange as keyof typeof m.reviewsByPeriod
                                ] || 0
                            )
                          ) || 10
                        }
                        className="h-2 bg-white/10"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating */}
        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex justify-between items-center">
              <span>Calificación ({timeRange})</span>
              <Star className="h-5 w-5 text-yellow-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-white/70 text-center py-6">Cargando...</div>
            ) : (
              <div className="space-y-3">
                {localesSeleccionados.map((local, index) => {
                  const metrics = restaurantMetrics[local.documentId];
                  if (!metrics) return null;

                  // Get rating for selected period
                  const periodRating =
                    metrics.ratingByPeriod[
                      timeRange as keyof typeof metrics.ratingByPeriod
                    ] || 0;

                  return (
                    <div key={local.id} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                          <span className="text-white text-sm">
                            {local.name}
                          </span>
                        </div>
                        <div className="text-white font-bold flex items-center">
                          {periodRating.toFixed(1)}
                          <Star className="h-3 w-3 text-yellow-400 ml-1" />
                        </div>
                      </div>
                      <Progress
                        value={periodRating}
                        max={5}
                        className="h-2 bg-white/10"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex justify-between items-center">
              <span>Conversión</span>
              <Zap className="h-5 w-5 text-amber-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-white/70 text-center py-6">Cargando...</div>
            ) : (
              <div className="space-y-3">
                {localesSeleccionados.map((local, index) => {
                  const metrics = restaurantMetrics[local.documentId];
                  if (!metrics) return null;

                  return (
                    <div key={local.id} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                          <span className="text-white text-sm">
                            {local.name}
                          </span>
                        </div>
                        <div className="text-white font-bold">
                          {metrics.conversionRate.toFixed(1)}%
                        </div>
                      </div>
                      <Progress
                        value={metrics.conversionRate}
                        max={100}
                        className="h-2 bg-white/10"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Positive Reviews */}
        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex justify-between items-center">
              <span>Reseñas Positivas</span>
              <Award className="h-5 w-5 text-green-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-white/70 text-center py-6">Cargando...</div>
            ) : (
              <div className="space-y-3">
                {localesSeleccionados.map((local, index) => {
                  const metrics = restaurantMetrics[local.documentId];
                  if (!metrics) return null;

                  return (
                    <div key={local.id} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                          <span className="text-white text-sm">
                            {local.name}
                          </span>
                        </div>
                        <div className="text-white font-bold">
                          {metrics.positiveReviewsPercent.toFixed(1)}%
                        </div>
                      </div>
                      <Progress
                        value={metrics.positiveReviewsPercent}
                        max={100}
                        className="h-2 bg-white/10"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend analysis */}
      <div className="mb-6">
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Análisis de Tendencias</CardTitle>
            <CardDescription className="text-white/60">
              Evolución de métricas clave en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-4">
                <TabsTrigger value="reviews" className="text-white">
                  Volumen de Reseñas
                </TabsTrigger>
                <TabsTrigger value="ratings" className="text-white">
                  Calificaciones
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reviews">
                {loading ? (
                  <div className="text-white/70 text-center py-6 h-[350px] flex items-center justify-center">
                    <div className="animate-spin mr-2">
                      <RefreshCw className="h-6 w-6 text-white/70" />
                    </div>
                    <span>Cargando datos...</span>
                  </div>
                ) : (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: 'none',
                            color: 'white',
                          }}
                          itemSorter={(a) => -(a.value ?? 0)}
                        />
                        <Legend />
                        {localesSeleccionados.map((local, index) => {
                          const metrics = restaurantMetrics[local.documentId];
                          if (!metrics) return null;

                          return (
                            <Line
                              key={local.id}
                              type="monotone"
                              dataKey={metrics.name}
                              stroke={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                              dot={{ fill: COLORS[index % COLORS.length] }}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ratings">
                {loading ? (
                  <div className="text-white/70 text-center py-6 h-[350px] flex items-center justify-center">
                    <div className="animate-spin mr-2">
                      <RefreshCw className="h-6 w-6 text-white/70" />
                    </div>
                    <span>Cargando datos...</span>
                  </div>
                ) : (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 5]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: 'none',
                            color: 'white',
                          }}
                          itemSorter={(a) => -(a.value ?? 0)}
                        />
                        <Legend />
                        {localesSeleccionados.map((local, index) => {
                          const metrics = restaurantMetrics[local.documentId];
                          if (!metrics) return null;

                          return (
                            <Line
                              key={local.id}
                              type="monotone"
                              dataKey={`${metrics.name} Rating`}
                              stroke={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                              dot={{ fill: COLORS[index % COLORS.length] }}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Tab-based comparative analysis */}
      <Card className="bg-white/10 border-0 mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">
              Análisis Comparativo Detallado
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className={`bg-white/10 border-white/20 hover:bg-white/20 text-white ${
                  comparativeTab === 'overview' ? 'bg-white/20' : ''
                }`}
                onClick={() => setComparativeTab('overview')}
              >
                Vista General
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`bg-white/10 border-white/20 hover:bg-white/20 text-white ${
                  comparativeTab === 'ratings' ? 'bg-white/20' : ''
                }`}
                onClick={() => setComparativeTab('ratings')}
              >
                Calificaciones
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`bg-white/10 border-white/20 hover:bg-white/20 text-white ${
                  comparativeTab === 'employees' ? 'bg-white/20' : ''
                }`}
                onClick={() => setComparativeTab('employees')}
              >
                Empleados
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`bg-white/10 border-white/20 hover:bg-white/20 text-white ${
                  comparativeTab === 'categories' ? 'bg-white/20' : ''
                }`}
                onClick={() => setComparativeTab('categories')}
              >
                Categorías
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-white/70 text-center py-6 h-[350px] flex items-center justify-center">
              <div className="animate-spin mr-2">
                <RefreshCw className="h-6 w-6 text-white/70" />
              </div>
              <span>Cargando datos comparativos...</span>
            </div>
          ) : (
            <>
              {/* Vista General */}
              {comparativeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tabla comparativa */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-white/80 py-3 px-2">
                            Local
                          </th>
                          <th className="text-center text-white/80 py-3 px-2">
                            Ciudad
                          </th>
                          <th className="text-center text-white/80 py-3 px-2">
                            Reseñas
                          </th>
                          <th className="text-center text-white/80 py-3 px-2">
                            Rating
                          </th>
                          <th className="text-center text-white/80 py-3 px-2">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparativeMetrics.map((local) => (
                          <tr
                            key={local.documentId}
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <td className="py-3 px-2 text-white font-medium">
                              {local.name}
                            </td>
                            <td className="py-3 px-2 text-white/80 text-center">
                              {local.city}
                            </td>
                            <td className="py-3 px-2 text-white text-center">
                              {local.totalReviews}
                            </td>
                            <td className="py-3 px-2 text-white text-center flex justify-center items-center">
                              {local.averageRating.toFixed(1)}
                              <Star className="h-3 w-3 text-yellow-400 ml-1" />
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Badge
                                className={`${
                                  local.overallStatus === 'good'
                                    ? 'bg-green-500'
                                    : 'bg-yellow-500'
                                }`}
                              >
                                {local.overallStatus === 'good'
                                  ? 'Óptimo'
                                  : 'Mejorable'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Radar chart */}
                  <div className="h-[400px] bg-white/5 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={radarData}
                      >
                        <PolarGrid stroke="rgba(255,255,255,0.2)" />
                        <PolarAngleAxis
                          dataKey="subject"
                          stroke="rgba(255,255,255,0.7)"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                          }}
                        />
                        {localesSeleccionados.map((local, index) => {
                          const metrics = restaurantMetrics[local.documentId];
                          if (!metrics) return null;

                          return (
                            <Radar
                              key={local.id}
                              name={metrics.name}
                              dataKey={metrics.name}
                              stroke={COLORS[index % COLORS.length]}
                              fill={COLORS[index % COLORS.length]}
                              fillOpacity={0.2}
                            />
                          );
                        })}
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Distribución de Calificaciones */}
              {comparativeTab === 'ratings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de distribución de calificaciones */}
                  <div className="h-[400px] bg-white/5 rounded-lg p-4">
                    <h3 className="text-white mb-4">
                      Distribución de Calificaciones
                    </h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={ratingDistribution}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: 'none',
                            color: 'white',
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="value"
                          name="Cantidad de reseñas"
                          fill="#8884d8"
                        >
                          {ratingDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.rating === 5
                                  ? '#4CAF50'
                                  : entry.rating === 4
                                  ? '#8BC34A'
                                  : entry.rating === 3
                                  ? '#FFC107'
                                  : entry.rating === 2
                                  ? '#FF9800'
                                  : '#F44336'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tabla de calificaciones por restaurante */}
                  <div className="h-[400px] bg-white/5 rounded-lg p-4 overflow-y-auto">
                    <h3 className="text-white mb-4">
                      Calificaciones por Restaurante
                    </h3>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-white/80 py-2 px-2">
                            Local
                          </th>
                          <th className="text-center text-white/80 py-2 px-2">
                            1★
                          </th>
                          <th className="text-center text-white/80 py-2 px-2">
                            2★
                          </th>
                          <th className="text-center text-white/80 py-2 px-2">
                            3★
                          </th>
                          <th className="text-center text-white/80 py-2 px-2">
                            4★
                          </th>
                          <th className="text-center text-white/80 py-2 px-2">
                            5★
                          </th>
                          <th className="text-center text-white/80 py-2 px-2">
                            Promedio
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {localesSeleccionados.map((local) => {
                          if (!allReviews[local.documentId]) return null;

                          const reviews = allReviews[local.documentId];
                          const metrics = restaurantMetrics[local.documentId];

                          // Count reviews by rating
                          const ratingCounts = {
                            1: reviews.filter((r) => r.calification === 1)
                              .length,
                            2: reviews.filter((r) => r.calification === 2)
                              .length,
                            3: reviews.filter((r) => r.calification === 3)
                              .length,
                            4: reviews.filter((r) => r.calification === 4)
                              .length,
                            5: reviews.filter((r) => r.calification === 5)
                              .length,
                          };

                          return (
                            <tr
                              key={local.documentId}
                              className="border-b border-white/10 hover:bg-white/5"
                            >
                              <td className="py-2 px-2 text-white font-medium">
                                {local.name}
                              </td>
                              <td className="py-2 px-2 text-center text-white/80">
                                {ratingCounts[1]}
                              </td>
                              <td className="py-2 px-2 text-center text-white/80">
                                {ratingCounts[2]}
                              </td>
                              <td className="py-2 px-2 text-center text-white/80">
                                {ratingCounts[3]}
                              </td>
                              <td className="py-2 px-2 text-center text-white/80">
                                {ratingCounts[4]}
                              </td>
                              <td className="py-2 px-2 text-center text-white/80">
                                {ratingCounts[5]}
                              </td>
                              <td className="py-2 px-2 text-center text-white font-medium flex justify-center items-center">
                                {metrics?.averageRating.toFixed(1) || 'N/A'}
                                <Star className="h-3 w-3 text-yellow-400 ml-1" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Análisis de Empleados */}
              {comparativeTab === 'employees' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top 10 Mejores Empleados */}
                  <div className="h-[400px] bg-white/5 rounded-lg p-4 overflow-y-auto">
                    <h3 className="text-white mb-4">
                      <Award className="h-5 w-5 text-yellow-400 inline mr-2" />
                      Top 10 Mejores Empleados
                    </h3>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-white/80 py-2 px-2">
                            #
                          </th>
                          <th className="text-left text-white/80 py-2 px-2">
                            Empleado
                          </th>
                          <th className="text-center text-white/80 py-2 px-2">
                            Reseñas
                          </th>
                          <th className="text-center text-white/80 py-2 px-2">
                            Rating
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {topEmployeesOverall.map((employee, index) => (
                          <tr
                            key={employee.documentId}
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <td className="py-2 px-2 text-white/80">
                              {index + 1}
                            </td>
                            <td className="py-2 px-2 text-white font-medium">
                              {employee.firstName} {employee.lastName}
                              <div className="text-xs text-white/60">
                                {employee.position}
                              </div>
                            </td>
                            <td className="py-2 px-2 text-center text-white/80">
                              {employee.reviewCount}
                            </td>
                            <td className="py-2 px-2 text-center text-white flex justify-center items-center">
                              {(employee.averageRating || 0).toFixed(1)}
                              <Star className="h-3 w-3 text-yellow-400 ml-1" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Comparación de equipos */}
                  <div className="h-[400px] bg-white/5 rounded-lg p-4 overflow-y-auto">
                    <h3 className="text-white mb-4">
                      <Users className="h-5 w-5 text-blue-400 inline mr-2" />
                      Rendimiento de Equipos
                    </h3>
                    <div className="space-y-6">
                      {localesSeleccionados.map((local) => {
                        const metrics = restaurantMetrics[local.documentId];
                        if (!metrics) return null;

                        return (
                          <div
                            key={local.documentId}
                            className="bg-white/5 p-3 rounded-lg"
                          >
                            <h4 className="text-white font-medium mb-2">
                              {local.name}
                            </h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="bg-white/5 p-2 rounded">
                                <div className="text-xs text-white/60">
                                  Tamaño del equipo
                                </div>
                                <div className="text-white">
                                  {metrics.employeeCount} empleados
                                </div>
                              </div>
                              <div className="bg-white/5 p-2 rounded">
                                <div className="text-xs text-white/60">
                                  Rating promedio
                                </div>
                                <div className="text-white flex items-center">
                                  {metrics.averageRating.toFixed(1)}
                                  <Star className="h-3 w-3 text-yellow-400 ml-1" />
                                </div>
                              </div>
                            </div>

                            {/* Top empleados del restaurante */}
                            {metrics.topEmployees.length > 0 ? (
                              <div>
                                <div className="text-sm text-white/60 mb-1">
                                  Empleados destacados:
                                </div>
                                {metrics.topEmployees.map((emp, i) => (
                                  <div
                                    key={emp.id}
                                    className="flex justify-between items-center text-sm py-1"
                                  >
                                    <span className="text-white">
                                      {i + 1}. {emp.name}
                                    </span>
                                    <span className="text-white flex items-center">
                                      {emp.rating.toFixed(1)}
                                      <Star className="h-3 w-3 text-yellow-400 ml-1" />
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-white/60 text-sm text-center py-2">
                                No hay empleados con suficientes reseñas
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Distribución de Categorías */}
              {comparativeTab === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de distribución de categorías */}
                  <div className="h-[400px] bg-white/5 rounded-lg p-4">
                    <h3 className="text-white mb-4">
                      Tipos de Mejora más Comunes
                    </h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            percent,
                            index,
                          }) => {
                            const RADIAN = Math.PI / 180;
                            const radius =
                              25 + innerRadius + (outerRadius - innerRadius);
                            const x =
                              cx + radius * Math.cos(-midAngle * RADIAN);
                            const y =
                              cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="white"
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                fontSize={12}
                              >
                                {categoryDistribution[index].name} (
                                {(percent * 100).toFixed(0)}%)
                              </text>
                            );
                          }}
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                          }}
                          formatter={(value: number) => [
                            `${value} reseñas`,
                            'Cantidad',
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Texto explicativo y estadísticas */}
                  <div className="h-[400px] bg-white/5 rounded-lg p-4 overflow-y-auto">
                    <h3 className="text-white mb-4">Análisis de Categorías</h3>
                    <p className="text-white/80 mb-4">
                      Las categorías de mejora indican las áreas que los
                      clientes mencionan con mayor frecuencia en sus reseñas.
                      Identificar estos patrones le permite enfocar sus
                      esfuerzos de mejora en los aspectos más críticos para sus
                      clientes.
                    </p>

                    <h4 className="text-white text-sm font-medium mb-2">
                      Principales categorías:
                    </h4>
                    <div className="space-y-2 mb-4">
                      {categoryDistribution
                        .slice(0, 5)
                        .map((category, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              ></div>
                              <span className="text-white">
                                {category.name}
                              </span>
                            </div>
                            <span className="text-white/80">
                              {category.value} reseñas
                            </span>
                          </div>
                        ))}
                    </div>

                    <h4 className="text-white text-sm font-medium mb-2">
                      Recomendaciones:
                    </h4>
                    <ul className="text-white/80 space-y-1 list-disc list-inside">
                      <li>
                        Enfoque sus esfuerzos de capacitación en las categorías
                        más frecuentes
                      </li>
                      <li>
                        Compare entre restaurantes para identificar mejores
                        prácticas
                      </li>
                      <li>
                        Establezca metas específicas para reducir comentarios
                        sobre áreas problemáticas
                      </li>
                      <li>
                        Implemente programas de incentivos enfocados en mejorar
                        áreas específicas
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Insights and recommendations */}
      <Card className="bg-white/10 border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">
              Insights y Recomendaciones con IA
            </CardTitle>
            <CardDescription className="text-white/60">
              Análisis inteligente basado en datos reales de tus restaurantes
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-2 items-center mr-2">
              <span className="text-white text-sm">Período:</span>
              <select
                className="bg-white/10 border-0 text-white p-2 rounded-md"
                value={insightTimeRange}
                onChange={(e) => setInsightTimeRange(e.target.value)}
              >
                <option value="day">Día</option>
                <option value="week">Semana</option>
                <option value="month">Mes</option>
                <option value="year">Año</option>
              </select>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
              onClick={requestNewInsights}
              disabled={
                insightLoading || loading || localesSeleccionados.length === 0
              }
            >
              {insightLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-amber-400" />
                  Generar nuevo análisis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lastInsightUpdate && (
            <div className="text-xs text-white/50 mb-3">
              Último análisis:{' '}
              {new Date(lastInsightUpdate).toLocaleDateString()}
              {new Date(lastInsightUpdate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' - '}
              <span className="text-amber-400">
                El análisis se puede actualizar una vez por semana
              </span>
            </div>
          )}

          {loading ? (
            <div className="text-white/70 text-center py-8">
              Cargando datos...
            </div>
          ) : insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {index === 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : index === 1 ? (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    ) : index === 2 ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                    )}
                    <h3 className="text-white font-semibold">
                      {index === 0
                        ? 'Mejores Prácticas'
                        : index === 1
                        ? 'Áreas de Mejora'
                        : index === 2
                        ? 'Alertas'
                        : 'Oportunidades'}
                    </h3>
                  </div>
                  <p className="text-white/80 whitespace-pre-line">{insight}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 p-6 rounded-lg text-center">
              <p className="text-white/80 mb-4">
                No hay análisis generados para los restaurantes seleccionados.
                Genera un análisis inteligente para obtener recomendaciones
                personalizadas basadas en los datos de tus restaurantes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedComparison;
