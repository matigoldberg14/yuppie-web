// src/components/dashboard/TeamContent.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import {
  getOwnerRestaurants,
  getEmployeesByRestaurant,
  getRestaurantReviews,
  createEmployee,
  deleteEmployee,
  updateEmployee,
  getRestaurantByFirebaseUID,
} from '../../services/api';
import type { Restaurant as RestaurantStore } from '../../lib/restaurantStore';
import { clearSelectedRestaurant } from '../../lib/restaurantStore';
import {
  Plus,
  User,
  Trash,
  Edit2,
  Star,
  Award,
  AlertCircle,
  Download,
  QrCode,
  Search,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../ui/card';
import { Button } from '../ui/Button';
import AddEmployeeForm from './AddEmployeeForm';
import { useToast } from '../ui/use-toast';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import * as XLSX from 'xlsx';
import type {
  Restaurant,
  Employee as BasicEmployee,
  Schedule,
  Review,
} from '../../types/index';
import {
  getSelectedRestaurant,
  setSelectedRestaurant,
  getCompareRestaurants,
  toggleCompareRestaurant as toggleCompare,
  setRestaurantsList,
} from '../../lib/restaurantStore';

// Definimos ReviewExt para incluir la propiedad opcional "employee"
type ReviewExt = Review & {
  employee?: {
    documentId: string;
    firstName?: string;
    lastName?: string;
    position?: string;
  };
};

// --- Tipos locales para este componente ---
interface LocalSchedule extends Schedule {}

export interface EnrichedEmployee extends BasicEmployee {
  reviewCount?: number;
  averageRating?: number;
  reviews?: ReviewExt[];
  lastReviewDate?: string | null;
  daysWithoutReview?: number | null;
  schedules: LocalSchedule[];
}

interface WorkSchedule {
  id?: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface EmployeeOfMonthResult {
  employee: EnrichedEmployee | null;
  score: number;
}

// Para obtener el restaurante seleccionado correctamente, verificamos que tenga las propiedades de un Restaurant
const getInitialRestaurant = (): Restaurant | null => {
  const r = getSelectedRestaurant();
  if (
    r &&
    typeof (r as any).name === 'string' &&
    typeof (r as any).taps === 'string' &&
    (r as any).owner
  ) {
    return r as Restaurant;
  }
  return null;
};

export function TeamContent() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null
  );
  const [employees, setEmployees] = useState<EnrichedEmployee[]>([]);
  const [reviews, setReviews] = useState<ReviewExt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<EnrichedEmployee | null>(null);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EnrichedEmployee | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('name'); // 'name', 'rating', 'reviews', 'lastReview'
  const [filterText, setFilterText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'leaderboard'>('grid');
  const { toast } = useToast();

  // El restaurante seleccionado se obtiene del store, forzándolo a tipo Restaurant
  const [selectedRestaurant, setSelectedRestaurantState] =
    useState<Restaurant | null>(getInitialRestaurant());

  // Escuchar el evento "restaurantChange" para actualizar el restaurante seleccionado
  useEffect(() => {
    const handleRestaurantChange = (e: CustomEvent) => {
      console.log('TeamContent: restaurantChange event received:', e.detail);
      setSelectedRestaurantState(e.detail as Restaurant);
    };
    window.addEventListener(
      'restaurantChange',
      handleRestaurantChange as EventListener
    );
    return () => {
      window.removeEventListener(
        'restaurantChange',
        handleRestaurantChange as EventListener
      );
    };
  }, []);

  // Obtener la lista de restaurantes del dueño
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (auth?.currentUser?.uid) {
        const ownerRestaurants = await getOwnerRestaurants(
          auth.currentUser.uid
        );
        setRestaurants(ownerRestaurants);

        // Guardar lista completa de restaurantes
        setRestaurantsList(ownerRestaurants);

        // Si solo hay un restaurante, seleccionarlo automáticamente
        if (ownerRestaurants.length === 1) {
          const singleRestaurant = ownerRestaurants[0];
          setCurrentRestaurant(singleRestaurant);
          setRestaurantId(singleRestaurant.documentId);
          setSelectedRestaurant(singleRestaurant);
        } else if (ownerRestaurants.length > 0) {
          // Verificar si el restaurante seleccionado pertenece al usuario actual
          const currentSelected = getSelectedRestaurant();
          if (currentSelected) {
            const isValid = ownerRestaurants.some(
              (r: RestaurantStore) =>
                r.documentId === currentSelected.documentId
            );
            if (isValid) {
              // Si es válido, usarlo
              setCurrentRestaurant(currentSelected);
              setRestaurantId(currentSelected.documentId);
            } else {
              // Si no es válido, no seleccionar ninguno
              clearSelectedRestaurant();
            }
          }
        }
      }
    };

    fetchRestaurants();
  }, []);

  // Si hay más de un restaurante, se usa el dropdown para elegir
  const handleRestaurantSelect = (documentId: string) => {
    const selected = restaurants.find((r) => r.documentId === documentId);
    if (selected) {
      setCurrentRestaurant(selected);
      setRestaurantId(selected.documentId);
      // Forzamos que el objeto tenga 'linkMaps' (si no existe, lo asignamos como cadena vacía)
      setSelectedRestaurant({ ...selected, linkMaps: selected.linkMaps ?? '' });
    }
  };

  // Obtener empleados y reseñas según el restaurante seleccionado
  useEffect(() => {
    const fetchEmployeesAndReviews = async () => {
      try {
        if (!auth?.currentUser?.uid || !restaurantId) {
          console.log('Usuario no autenticado o restaurantId no definido');
          return;
        }
        const employeesData = await getEmployeesByRestaurant(restaurantId);
        const reviewsData = (await getRestaurantReviews(
          restaurantId
        )) as ReviewExt[];
        setReviews(reviewsData);

        const enrichedEmployees: EnrichedEmployee[] = employeesData.map(
          (employee: any): EnrichedEmployee => {
            const employeeReviews = reviewsData.filter(
              (review: ReviewExt) =>
                review.employee?.documentId === employee.documentId
            );
            const reviewCount = employeeReviews.length;
            const totalRating = employeeReviews.reduce(
              (sum: number, review: ReviewExt) => sum + review.calification,
              0
            );
            const averageRating =
              reviewCount > 0 ? totalRating / reviewCount : 0;
            const sortedReviews = [...employeeReviews].sort(
              (a: ReviewExt, b: ReviewExt) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
            const lastReviewDate =
              sortedReviews.length > 0 ? sortedReviews[0].createdAt : null;
            const daysWithoutReview = lastReviewDate
              ? Math.floor(
                  (new Date().getTime() - new Date(lastReviewDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;
            return {
              ...employee,
              reviewCount,
              averageRating,
              reviews: employeeReviews,
              lastReviewDate,
              daysWithoutReview,
              schedules: employee.schedules || [],
            };
          }
        );
        setEmployees(enrichedEmployees);
      } catch (error) {
        console.error('Error fetching employees and reviews:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los datos del equipo',
        });
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) {
      fetchEmployeesAndReviews();
    }
  }, [toast, restaurantId]);

  // Ordenar empleados
  const sortedEmployees: EnrichedEmployee[] = [...employees].sort(
    (a, b): number => {
      switch (sortOption) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'lastReview':
          if (!a.lastReviewDate) return 1;
          if (!b.lastReviewDate) return -1;
          return (
            new Date(b.lastReviewDate).getTime() -
            new Date(a.lastReviewDate).getTime()
          );
        default:
          return 0;
      }
    }
  );

  const filteredEmployees: EnrichedEmployee[] = sortedEmployees.filter(
    (employee: EnrichedEmployee) => {
      const fullName =
        `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return (
        fullName.includes(filterText.toLowerCase()) ||
        employee.position.toLowerCase().includes(filterText.toLowerCase())
      );
    }
  );

  const getEmployeeOfTheMonth = (): EmployeeOfMonthResult => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    let bestEmployee: EnrichedEmployee | null = null;
    let highestScore = -1;
    sortedEmployees.forEach((employee: EnrichedEmployee) => {
      if (!employee.reviews) return;
      const lastMonthReviews = employee.reviews.filter((review: ReviewExt) => {
        const reviewDate = new Date(review.createdAt);
        return reviewDate >= oneMonthAgo && review.calification >= 4;
      });
      const score = lastMonthReviews.length;
      if (score > highestScore) {
        highestScore = score;
        bestEmployee = employee;
      }
    });
    return { employee: bestEmployee, score: highestScore };
  };

  const getEmployeesNeedingAttention = (): EnrichedEmployee[] => {
    return sortedEmployees
      .filter(
        (employee: EnrichedEmployee) => (employee.daysWithoutReview || 30) > 14
      )
      .sort(
        (a: EnrichedEmployee, b: EnrichedEmployee) =>
          (b.daysWithoutReview || 0) - (a.daysWithoutReview || 0)
      )
      .slice(0, 3);
  };

  const getTopRatedEmployees = (): EnrichedEmployee[] => {
    return sortedEmployees
      .filter((employee: EnrichedEmployee) => (employee.reviewCount || 0) >= 3)
      .sort(
        (a: EnrichedEmployee, b: EnrichedEmployee) =>
          (b.averageRating || 0) - (a.averageRating || 0)
      )
      .slice(0, 3);
  };

  const topRatedEmployees: EnrichedEmployee[] = (() => {
    try {
      return sortedEmployees
        .filter((employee: EnrichedEmployee) => {
          const reviewCount = employee.reviewCount;
          return (
            typeof reviewCount === 'number' &&
            !isNaN(reviewCount) &&
            reviewCount >= 3
          );
        })
        .sort((a: EnrichedEmployee, b: EnrichedEmployee) => {
          const ratingA = a.averageRating || 0;
          const ratingB = b.averageRating || 0;
          return ratingB - ratingA;
        })
        .slice(0, 3);
    } catch (error) {
      console.error('Error obteniendo empleados mejor calificados:', error);
      return [];
    }
  })();

  // Para agregar un empleado (forzamos photo a null)
  const handleAddEmployee = async (data: {
    firstName: string;
    lastName: string;
    position: string;
    schedules: WorkSchedule[];
    photo?: File | null;
  }) => {
    try {
      if (!restaurantId) throw new Error('No restaurant ID');
      await createEmployee({ ...data, photo: null, restaurantId });
      if (restaurantId) {
        const updatedEmployees = await getEmployeesByRestaurant(restaurantId);
        const enrichedEmployees: EnrichedEmployee[] = updatedEmployees.map(
          (employee: any) => ({
            ...employee,
            reviewCount: 0,
            averageRating: 0,
            reviews: [],
            lastReviewDate: null,
            daysWithoutReview: null,
            schedules: employee.schedules || [],
          })
        );
        setEmployees(enrichedEmployees);
        setIsAddingEmployee(false);
        toast({
          title: 'Éxito',
          description: 'Empleado agregado correctamente',
        });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo agregar el empleado',
      });
      throw error;
    }
  };

  // Para editar un empleado (forzamos photo a null)
  const handleEditEmployee = async (data: {
    firstName: string;
    lastName: string;
    position: string;
    schedules: WorkSchedule[];
    photo?: File | null;
  }) => {
    try {
      if (!editingEmployee) return;
      await updateEmployee(editingEmployee.documentId, {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        schedules: data.schedules,
        photo: null,
      });
      if (restaurantId) {
        const updatedEmployees = await getEmployeesByRestaurant(restaurantId);
        const enrichedEmployees: EnrichedEmployee[] = updatedEmployees.map(
          (employee: any) => {
            const existingEmployee = employees.find(
              (e) => e.documentId === employee.documentId
            );
            return {
              ...employee,
              reviewCount: existingEmployee?.reviewCount || 0,
              averageRating: existingEmployee?.averageRating || 0,
              reviews: existingEmployee?.reviews || [],
              lastReviewDate: existingEmployee?.lastReviewDate || null,
              daysWithoutReview: existingEmployee?.daysWithoutReview || null,
              schedules: employee.schedules || [],
            };
          }
        );
        setEmployees(enrichedEmployees);
      }
      setEditingEmployee(null);
      toast({
        title: 'Éxito',
        description: 'Empleado actualizado correctamente',
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el empleado',
      });
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este empleado?'))
      return;
    try {
      await deleteEmployee(employeeId);
      setEmployees(employees.filter((emp) => emp.documentId !== employeeId));
      toast({
        title: 'Éxito',
        description: 'Empleado eliminado correctamente',
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el empleado',
      });
    }
  };

  const generateEmployeeQRUrl = (employeeId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/rating?local=${restaurantId}&employee=${employeeId}`;
  };

  const handleGenerateQR = (employee: EnrichedEmployee) => {
    const url = generateEmployeeQRUrl(employee.documentId);
    prompt(
      `URL para escanear y dejar reseña para ${employee.firstName} ${employee.lastName}:`,
      url
    );
  };

  const handleExportEmployeesData = () => {
    const exportData = employees.map((employee: EnrichedEmployee) => ({
      Nombre: `${employee.firstName} ${employee.lastName}`,
      Posición: employee.position,
      Reseñas: employee.reviewCount || 0,
      'Calificación Promedio': employee.averageRating
        ? employee.averageRating.toFixed(1)
        : 'N/A',
      'Última Reseña': employee.lastReviewDate
        ? new Date(employee.lastReviewDate).toLocaleDateString()
        : 'N/A',
      'Días Sin Reseña': employee.daysWithoutReview || 'N/A',
      ID: employee.documentId,
      'URL de Reseña': generateEmployeeQRUrl(employee.documentId),
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    const columnWidths = [
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 60 },
    ];
    ws['!cols'] = columnWidths;
    XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
    XLSX.writeFile(
      wb,
      `empleados_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-white">Cargando equipo...</div>
      </div>
    );
  }

  const {
    employee: employeeOfMonth,
    score: employeeOfMonthScore,
  }: EmployeeOfMonthResult = (() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    let bestEmployee: EnrichedEmployee | null = null;
    let highestScore = -1;

    sortedEmployees.forEach((employee: EnrichedEmployee) => {
      // Verificación de seguridad para reviews
      if (!employee.reviews || !Array.isArray(employee.reviews)) return;

      try {
        const lastMonthReviews = employee.reviews.filter(
          (review: ReviewExt) => {
            if (!review || !review.createdAt) return false;

            try {
              const reviewDate = new Date(review.createdAt);
              return (
                !isNaN(reviewDate.getTime()) &&
                reviewDate >= oneMonthAgo &&
                review.calification >= 4
              );
            } catch (e) {
              console.error('Error al procesar fecha:', e);
              return false;
            }
          }
        );

        const score = lastMonthReviews.length;
        if (score > highestScore) {
          highestScore = score;
          bestEmployee = employee;
        }
      } catch (error) {
        console.error('Error procesando empleado:', employee.documentId, error);
      }
    });

    return { employee: bestEmployee, score: highestScore };
  })();

  // Empleados que necesitan atención - implementación mejorada
  const employeesNeedingAttention: EnrichedEmployee[] = (() => {
    try {
      return sortedEmployees
        .filter((employee: EnrichedEmployee) => {
          // Asegurarse de que daysWithoutReview sea un número válido
          const days = employee.daysWithoutReview;
          return typeof days === 'number' && !isNaN(days) && days > 14;
        })
        .sort((a: EnrichedEmployee, b: EnrichedEmployee) => {
          const daysA = a.daysWithoutReview || 0;
          const daysB = b.daysWithoutReview || 0;
          return daysB - daysA;
        })
        .slice(0, 3);
    } catch (error) {
      console.error(
        'Error obteniendo empleados que necesitan atención:',
        error
      );
      return [];
    }
  })();

  return (
    <div className="p-8">
      {/* Si hay más de un restaurante, mostrar dropdown para seleccionar */}
      {restaurants.length > 1 && (
        <div className="mb-4">
          <Select onValueChange={(val: string) => handleRestaurantSelect(val)}>
            <SelectTrigger className="bg-white/10 text-white">
              <SelectValue placeholder="Selecciona restaurante" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((r) => (
                <SelectItem key={r.documentId} value={r.documentId}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Tabs defaultValue="overview">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Equipo</h1>
            <TabsList className="bg-white/10">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white/20"
              >
                Vista General
              </TabsTrigger>
              <TabsTrigger
                value="employees"
                className="data-[state=active]:bg-white/20"
              >
                Empleados
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-white/20"
              >
                Estadísticas
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleExportEmployeesData}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Datos
            </Button>
            <Button
              onClick={() => setIsAddingEmployee(true)}
              className="bg-white text-black hover:bg-white/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar miembro
            </Button>
          </div>
        </div>
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-0">
              <CardHeader>
                <CardTitle className="text-white">Empleado del Mes</CardTitle>
                <CardDescription className="text-white/70">
                  Basado en reseñas positivas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employeeOfMonth ? (
                  (() => {
                    const employee: EnrichedEmployee = employeeOfMonth;
                    return (
                      <div className="flex items-center">
                        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mr-4">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {employee.firstName} {employee.lastName}
                          </h3>
                          <p className="text-white/70">{employee.position}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Award className="h-4 w-4 text-yellow-400" />
                            <span className="text-white/80">
                              {employeeOfMonthScore} reseñas positivas
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-white/70">
                    No hay suficientes datos para determinar el empleado del
                    mes.
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-0">
              <CardHeader>
                <CardTitle className="text-white">Top Calificaciones</CardTitle>
                <CardDescription className="text-white/70">
                  Empleados con mejores reseñas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topRatedEmployees.length > 0 ? (
                    topRatedEmployees.map(
                      (employee: EnrichedEmployee, index: number) => (
                        <div
                          key={employee.documentId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="mr-2 w-5 text-center text-white/70">
                              #{index + 1}
                            </div>
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-white">
                              {employee.firstName} {employee.lastName}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-white">
                              {employee.averageRating?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-white/70">
                      No hay suficientes datos para determinar top
                      calificaciones.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-600/30 to-red-600/30 border-0">
              <CardHeader>
                <CardTitle className="text-white">Necesitan Atención</CardTitle>
                <CardDescription className="text-white/70">
                  Empleados sin reseñas recientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const needing: EnrichedEmployee[] = sortedEmployees
                      .filter(
                        (employee: EnrichedEmployee) =>
                          (employee.daysWithoutReview || 30) > 14
                      )
                      .sort(
                        (a: EnrichedEmployee, b: EnrichedEmployee) =>
                          (b.daysWithoutReview || 0) -
                          (a.daysWithoutReview || 0)
                      )
                      .slice(0, 3);
                    if (needing.length > 0) {
                      return needing.map((employee: EnrichedEmployee) => (
                        <div
                          key={employee.documentId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-white">
                              {employee.firstName} {employee.lastName}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-orange-400 mr-1" />
                            <span className="text-white/70">
                              {employee.daysWithoutReview} días
                            </span>
                          </div>
                        </div>
                      ));
                    } else {
                      return (
                        <div className="text-white/70">
                          ¡Genial! Todos los empleados tienen reseñas recientes.
                        </div>
                      );
                    }
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-white/10 border-0">
            <CardHeader>
              <CardTitle className="text-white">Resumen de Equipo</CardTitle>
              <CardDescription className="text-white/70">
                Vista rápida de todos los empleados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedEmployees.map((employee: EnrichedEmployee) => (
                  <div
                    key={employee.documentId}
                    className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {employee.position}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white/5 p-2 rounded">
                        <div className="text-white/60">Reseñas</div>
                        <div className="text-white font-medium">
                          {employee.reviewCount || 0}
                        </div>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <div className="text-white/60">Calificación</div>
                        <div className="text-white font-medium flex items-center">
                          {employee.averageRating
                            ? employee.averageRating.toFixed(1)
                            : '-'}
                          {employee.averageRating && (
                            <Star className="h-4 w-4 text-yellow-400 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="employees" className="mt-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  placeholder="Buscar empleado..."
                  className="pl-9 bg-white/5 border-white/10 text-white w-full md:w-64 h-10"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
              <Select onValueChange={(val: string) => setSortOption(val)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white w-[160px] h-10">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10 text-white">
                  <SelectItem value="name" className="py-2.5">
                    Nombre
                  </SelectItem>
                  <SelectItem value="rating" className="py-2.5">
                    Calificación
                  </SelectItem>
                  <SelectItem value="reviews" className="py-2.5">
                    Cantidad de reseñas
                  </SelectItem>
                  <SelectItem value="lastReview" className="py-2.5">
                    Última reseña
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-md overflow-hidden border border-white/20">
                <Button
                  variant="primary"
                  className={
                    viewMode === 'grid'
                      ? 'bg-white text-black font-medium'
                      : 'bg-transparent text-white/80 border-r border-white/20 hover:bg-white/10'
                  }
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant="primary"
                  className={
                    viewMode === 'leaderboard'
                      ? 'bg-white text-black font-medium'
                      : 'bg-transparent text-white/80 hover:bg-white/10'
                  }
                  size="sm"
                  onClick={() => setViewMode('leaderboard')}
                >
                  Ranking
                </Button>
              </div>
            </div>
          </div>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((employee: EnrichedEmployee) => (
                <Card
                  key={employee.documentId}
                  className="bg-white/10 border-0 overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {employee.firstName} {employee.lastName}
                            </h3>
                            <p className="text-white/60">{employee.position}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEmployee(employee);
                            }}
                            className="text-blue-400 hover:text-blue-500 hover:bg-blue-400/10 h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(employee.documentId);
                            }}
                            className="text-red-400 hover:text-red-500 hover:bg-red-400/10 h-8 w-8"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/5 p-3 rounded">
                          <p className="text-white/60 text-sm mb-1">Reseñas</p>
                          <p className="text-white text-lg font-semibold">
                            {employee.reviewCount || 0}
                          </p>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <p className="text-white/60 text-sm mb-1">
                            Calificación
                          </p>
                          <div className="flex items-center">
                            <p className="text-white text-lg font-semibold">
                              {employee.averageRating
                                ? employee.averageRating.toFixed(1)
                                : '-'}
                            </p>
                            {employee.averageRating && (
                              <Star className="h-4 w-4 text-yellow-400 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex border-t border-white/10">
                      <Button
                        variant="ghost"
                        className="flex-1 rounded-none border-r border-white/10 text-white/80 h-12"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex items-center justify-center space-x-2 rounded-none text-white/80 h-12 hover:bg-white/10 transition-colors"
                        onClick={() => handleGenerateQR(employee)}
                      >
                        <QrCode className="h-4 w-4" />
                        <span>Generar QR</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {viewMode === 'leaderboard' && (
            <Card className="bg-white/10 border-0">
              <CardContent className="p-0">
                <div className="py-2">
                  <table className="w-full">
                    <thead>
                      <tr className="text-white/60 text-left border-b border-white/10">
                        <th className="px-6 py-3">#</th>
                        <th className="px-6 py-3">Empleado</th>
                        <th className="px-6 py-3 text-center">Reseñas</th>
                        <th className="px-6 py-3 text-center">Calificación</th>
                        <th className="px-6 py-3 text-center">Última reseña</th>
                        <th className="px-6 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map(
                        (employee: EnrichedEmployee, index: number) => (
                          <tr
                            key={employee.documentId}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 text-white/60">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="text-white font-medium">
                                    {employee.firstName} {employee.lastName}
                                  </div>
                                  <div className="text-white/60 text-sm">
                                    {employee.position}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge
                                variant="outline"
                                className="bg-white/5 text-white"
                              >
                                {employee.reviewCount || 0}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center">
                                {employee.averageRating ? (
                                  <>
                                    <span className="text-white mr-1">
                                      {employee.averageRating.toFixed(1)}
                                    </span>
                                    <Star className="h-4 w-4 text-yellow-400" />
                                  </>
                                ) : (
                                  <span className="text-white/40">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-white/80">
                              {employee.lastReviewDate
                                ? new Date(
                                    employee.lastReviewDate
                                  ).toLocaleDateString()
                                : 'Sin reseñas'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedEmployee(employee)}
                                  className="text-white/80 hover:text-white hover:bg-white/10"
                                >
                                  Detalles
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleGenerateQR(employee)}
                                  className="text-white/80 hover:text-white hover:bg-white/10"
                                >
                                  <QrCode className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingEmployee(employee)}
                                  className="text-blue-400 hover:text-blue-500 hover:bg-blue-400/10"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteEmployee(employee.documentId)
                                  }
                                  className="text-red-400 hover:text-red-500 hover:bg-red-400/10"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {selectedEmployee && (
        <Dialog
          open={!!selectedEmployee}
          onOpenChange={() => setSelectedEmployee(null)}
        >
          <DialogContent className="bg-gray-900 text-white max-h-[90vh] overflow-y-auto max-w-4xl">
            <DialogTitle className="flex justify-between items-center">
              <span>Detalles del Empleado</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    selectedEmployee && handleGenerateQR(selectedEmployee)
                  }
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingEmployee(selectedEmployee);
                    setSelectedEmployee(null);
                  }}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </DialogTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center mb-4">
                  <div className="h-32 w-32 rounded-full bg-white/20 flex items-center justify-center mb-3">
                    <User className="h-16 w-16 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <p className="text-white/60">{selectedEmployee.position}</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white/60 mb-2 text-sm">Métricas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-white/60 text-sm">Total reseñas</p>
                        <p className="text-white text-xl font-semibold">
                          {selectedEmployee.reviewCount || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Calificación</p>
                        <div className="flex items-center">
                          <p className="text-white text-xl font-semibold">
                            {selectedEmployee.averageRating
                              ? selectedEmployee.averageRating.toFixed(1)
                              : '-'}
                          </p>
                          {selectedEmployee.averageRating && (
                            <Star className="h-5 w-5 text-yellow-400 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white/60 mb-2 text-sm">Horarios</h3>
                    <div className="space-y-1">
                      {selectedEmployee.schedules.map(
                        (schedule: LocalSchedule) => (
                          <div
                            key={schedule.documentId}
                            className="flex justify-between"
                          >
                            <span className="text-white capitalize">
                              {schedule.day}
                            </span>
                            <span className="text-white/70">
                              {schedule.startTime.slice(0, 5)} -{' '}
                              {schedule.endTime.slice(0, 5)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">
                    Reseñas recibidas
                  </h3>
                  <span className="text-white/60">
                    {selectedEmployee.reviewCount || 0} total
                  </span>
                </div>
                {selectedEmployee.reviews &&
                selectedEmployee.reviews.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {selectedEmployee.reviews
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((review: ReviewExt) => (
                        <div
                          key={review.id}
                          className="bg-white/5 p-4 rounded-lg"
                        >
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.calification
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-400'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-white/60 text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-white mb-2">{review.comment}</p>
                          <div className="flex items-center text-sm text-white/60">
                            <span className="bg-white/10 px-2 py-1 rounded">
                              {review.typeImprovement}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-white/60 text-center py-8 bg-white/5 rounded-lg">
                    Este empleado aún no tiene reseñas.
                  </div>
                )}
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="text-white/60 mb-3 text-sm">
                    Distribución de calificaciones
                  </h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating: number) => {
                      if (!selectedEmployee.reviews) return null;
                      const count = selectedEmployee.reviews.filter(
                        (r) => r.calification === rating
                      ).length;
                      const percentage = selectedEmployee.reviews.length
                        ? (count / selectedEmployee.reviews.length) * 100
                        : 0;
                      return (
                        <div key={rating} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center text-white">
                              {rating}{' '}
                              <Star className="h-3 w-3 text-yellow-400 mx-1" />
                            </div>
                            <div className="text-white/70">
                              {count} reseña{count !== 1 ? 's' : ''} (
                              {percentage.toFixed(0)}%)
                            </div>
                          </div>
                          <Progress
                            value={percentage}
                            className="h-2 bg-white/10"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {restaurantId && (
        <AddEmployeeForm
          isOpen={isAddingEmployee || !!editingEmployee}
          onClose={() => {
            setIsAddingEmployee(false);
            setEditingEmployee(null);
          }}
          onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
          restaurantId={restaurantId}
          initialData={
            editingEmployee
              ? {
                  ...editingEmployee,
                  schedules: editingEmployee.schedules.map(
                    (s: LocalSchedule) => ({
                      ...s,
                      id: s.id.toString(),
                    })
                  ),
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

export default TeamContent;
