// src/components/dashboard/AdvancedComparison.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Map,
  Users,
  DollarSign,
  Star,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Share2,
  Search,
  MapPin,
  BarChart3,
  Check,
} from 'lucide-react';
import {
  getSelectedRestaurant,
  getCompareRestaurants,
} from '../../lib/restaurantStore';

export interface Restaurant {
  id: number;
  documentId: string;
  name: string;
  taps: string;
  owner: {
    firstName: string;
    lastName: string;
  };
  ingresos?: number;
  clientes?: number;
  satisfaccion?: number;
  ocupacion?: number;
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

const AdvancedComparison: React.FC<AdvancedComparisonProps> = ({
  restaurants,
}) => {
  const [selectedLocales, setSelectedLocales] = useState<number[]>([]);
  const [timeRange, setTimeRange] = useState('6m');
  const [searchTerm, setSearchTerm] = useState('');
  const [localesFiltrados, setLocalesFiltrados] =
    useState<Restaurant[]>(restaurants);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null
  );
  const [compareRestaurants, setCompareRestaurants] = useState<Restaurant[]>(
    []
  );

  // Cargar datos iniciales y escuchar por cambios
  useEffect(() => {
    // Cargar estado inicial
    const loadInitialState = () => {
      const selected = getSelectedRestaurant();
      const comparisonList = getCompareRestaurants();

      setCurrentRestaurant(selected);
      setCompareRestaurants(comparisonList);

      // Configurar lista de seleccionados basado en el restaurante principal y la lista de comparación
      const ids: number[] = []; // Explícitamente definir el tipo como number[]
      if (selected) ids.push(selected.id);
      comparisonList.forEach((r) => {
        if (!ids.includes(r.id)) ids.push(r.id);
      });

      setSelectedLocales(ids);
    };

    loadInitialState();

    // Escuchar cambios en el estado
    const handleSelectedChange = (e: CustomEvent) => {
      setCurrentRestaurant(e.detail);
      loadInitialState(); // Recargar todos los IDs seleccionados
    };

    const handleCompareChange = (e: CustomEvent) => {
      setCompareRestaurants(e.detail);
      loadInitialState(); // Recargar todos los IDs seleccionados
    };

    window.addEventListener(
      'restaurantChange',
      handleSelectedChange as EventListener
    );
    window.addEventListener(
      'compareRestaurantsChange',
      handleCompareChange as EventListener
    );

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

  // Hardcoded city for restaurants
  const getCiudad = (restaurantId: number) => {
    const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
    return cities[restaurantId % cities.length];
  };

  // Generate monthly sales data based on restaurants
  const generateMonthlySales = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    return months.map((month) => {
      const monthData: any = { mes: month };
      restaurants.forEach((restaurant) => {
        const baseValue = restaurant.ingresos ? restaurant.ingresos / 6 : 50000;
        const variance = Math.random() * 0.2 - 0.1; // -10% to +10%
        monthData[restaurant.name] = Math.floor(baseValue * (1 + variance));
      });
      return monthData;
    });
  };

  // Generate radar chart data based on restaurants
  const generateRadarData = () => {
    const metrics = [
      'Ventas',
      'Satisfacción',
      'Ocupación',
      'Retención',
      'Ticket Medio',
    ];
    return metrics.map((metric) => {
      const metricData: any = { subject: metric };
      restaurants.forEach((restaurant) => {
        let value;
        switch (metric) {
          case 'Ventas':
            value = normalizeStat(restaurant.ingresos || 0, 150000, 50);
            break;
          case 'Satisfacción':
            value = normalizeStat(
              parseFloat(restaurant.satisfaccion?.toString() || '0') * 20,
              100,
              50
            );
            break;
          case 'Ocupación':
            value = normalizeStat(restaurant.ocupacion || 0, 100, 50);
            break;
          default:
            value = 50 + Math.random() * 40;
        }
        metricData[restaurant.name] = Math.round(value);
      });
      return metricData;
    });
  };

  // Normalize a stat value to a 0-100 scale with a min floor
  const normalizeStat = (value: number, maxValue: number, minFloor: number) => {
    return Math.max(minFloor, Math.min(100, (value / maxValue) * 100));
  };

  const ventasMensuales = generateMonthlySales();
  const radarData = generateRadarData();

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

  const calcularPromedio = (campo: keyof Restaurant) => {
    const validRestaurants = restaurants.filter(
      (r) => r[campo] !== undefined && r[campo] !== null
    );
    if (validRestaurants.length === 0) return 0;

    const total = validRestaurants.reduce((sum, local) => {
      const value = local[campo];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);

    return total / validRestaurants.length;
  };

  const compararConPromedio = (valor: number, campo: keyof Restaurant) => {
    const promedio = calcularPromedio(campo);
    if (promedio === 0) return { porEncima: true, porcentaje: '0.0' };

    const porcentaje = ((valor - promedio) / promedio) * 100;
    return {
      porEncima: valor > promedio,
      porcentaje: Math.abs(porcentaje).toFixed(1),
    };
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

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
            <Select onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="bg-white/10 border-0 text-white">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Último mes</SelectItem>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="1y">Último año</SelectItem>
              </SelectContent>
            </Select>
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
          <Button
            variant="secondary"
            className="bg-white/10 border-0 text-white hover:bg-white/20"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Map of restaurants */}
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
                  <span>Rendimiento alto</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Rendimiento medio</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Rendimiento bajo</span>
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

      {/* Rest of component is unchanged */}
      {/* Comparative metrics, charts, and table sections */}
      {/* ... */}

      {/* El resto del componente se mantiene igual - sólo mostraré la parte que cambia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex justify-between items-center">
              <span>Ingresos</span>
              <DollarSign className="h-5 w-5 text-green-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="comparacion" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger value="comparacion" className="text-white">
                  Comparación
                </TabsTrigger>
                <TabsTrigger value="tendencia" className="text-white">
                  Tendencia
                </TabsTrigger>
              </TabsList>
              <TabsContent value="comparacion">
                <div className="space-y-2 mt-2">
                  {localesSeleccionados.map((local, index) => (
                    <div
                      key={local.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className="text-white text-sm">{local.name}</span>
                      </div>
                      <div className="text-white font-bold">
                        ${local.ingresos?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="tendencia">
                <div className="h-[100px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ventasMensuales.slice(-3)}>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                        }}
                      />
                      {localesSeleccionados.map((local, index) => (
                        <Line
                          key={local.id}
                          type="monotone"
                          dataKey={local.name}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          dot={{ fill: COLORS[index % COLORS.length] }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Comparison charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Comparación de Ventas</CardTitle>
            <CardDescription className="text-white/60">
              Evolución de ventas por local en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ventasMensuales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="mes" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                    }}
                  />
                  <Legend />
                  {localesSeleccionados.map((local, index) => (
                    <Line
                      key={local.id}
                      type="monotone"
                      dataKey={local.name}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ fill: COLORS[index % COLORS.length] }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Análisis Comparativo</CardTitle>
            <CardDescription className="text-white/60">
              Comparación de KPIs entre locales seleccionados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <PolarRadiusAxis stroke="rgba(255,255,255,0.5)" />
                  {localesSeleccionados.slice(0, 3).map((local, index) => (
                    <Radar
                      key={local.id}
                      name={local.name}
                      dataKey={local.name}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparative table */}
      <Card className="bg-white/10 border-0 mb-6">
        <CardHeader>
          <CardTitle className="text-white">
            Tabla Comparativa de Locales
          </CardTitle>
          <CardDescription className="text-white/60">
            Análisis detallado de métricas por local
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Local</th>
                  <th className="text-left py-3 px-4">Ciudad</th>
                  <th className="text-right py-3 px-4">Ingresos</th>
                  <th className="text-right py-3 px-4">Clientes</th>
                  <th className="text-right py-3 px-4">Satisfacción</th>
                  <th className="text-right py-3 px-4">Ocupación</th>
                  <th className="text-right py-3 px-4">Vs. Promedio</th>
                </tr>
              </thead>
              <tbody>
                {localesSeleccionados.map((local) => {
                  const comparacion = compararConPromedio(
                    local.ingresos || 0,
                    'ingresos'
                  );
                  return (
                    <tr
                      key={local.id}
                      className="border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="py-3 px-4 font-medium">{local.name}</td>
                      <td className="py-3 px-4">{getCiudad(local.id)}</td>
                      <td className="py-3 px-4 text-right">
                        ${local.ingresos?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {local.clientes?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {local.satisfaccion || 'N/A'}/5.0
                      </td>
                      <td className="py-3 px-4 text-right">
                        {local.ocupacion || 'N/A'}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {comparacion.porEncima ? (
                            <>
                              <span className="text-green-400">
                                +{comparacion.porcentaje}%
                              </span>
                              <ArrowUpRight className="h-4 w-4 text-green-400" />
                            </>
                          ) : (
                            <>
                              <span className="text-red-400">
                                -{comparacion.porcentaje}%
                              </span>
                              <ArrowDownRight className="h-4 w-4 text-red-400" />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights and recommendations */}
      <Card className="bg-white/10 border-0">
        <CardHeader>
          <CardTitle className="text-white">
            Insights y Recomendaciones
          </CardTitle>
          <CardDescription className="text-white/60">
            Análisis inteligente basado en la comparación de locales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <h3 className="text-white font-semibold">Mejores Prácticas</h3>
              </div>
              <p className="text-white/80 mb-2">
                {localesSeleccionados.length > 0
                  ? `El local "${localesSeleccionados[0].name}" tiene el mejor rendimiento. Considera implementar sus estrategias de servicio al cliente y marketing en otros locales.`
                  : 'Selecciona restaurantes para comparar y obtener mejores prácticas.'}
              </p>
              <ul className="space-y-1 text-white/80">
                <li>• Menú de temporada con productos locales</li>
                <li>• Programa de fidelización personalizado</li>
                <li>• Capacitación continua del personal</li>
              </ul>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                <h3 className="text-white font-semibold">Áreas de Mejora</h3>
              </div>
              <p className="text-white/80 mb-2">
                {localesSeleccionados.length > 1
                  ? `El local "${localesSeleccionados[1].name}" muestra una satisfacción por debajo del promedio. Recomendamos revisar la experiencia del cliente y la calidad del servicio.`
                  : 'Selecciona más restaurantes para identificar áreas de mejora.'}
              </p>
              <ul className="space-y-1 text-white/80">
                <li>• Revisar tiempos de espera y atención</li>
                <li>• Evaluar la calidad de los platos más vendidos</li>
                <li>• Mejorar la ambientación del local</li>
              </ul>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <h3 className="text-white font-semibold">Alertas</h3>
              </div>
              <p className="text-white/80">
                {localesSeleccionados.length > 0
                  ? `El local "${localesSeleccionados[0].name}" muestra una tendencia a la baja en ocupación durante los últimos 3 meses. Recomendamos implementar estrategias de promoción específicas.`
                  : 'Selecciona restaurantes para identificar posibles alertas.'}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <h3 className="text-white font-semibold">Oportunidades</h3>
              </div>
              <p className="text-white/80">
                {localesSeleccionados.length > 0
                  ? `El local "${localesSeleccionados[0].name}" tiene potencial para aumentar el ticket medio. Considera implementar estrategias de upselling y promociones especiales de fin de semana.`
                  : 'Selecciona restaurantes para identificar oportunidades de crecimiento.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedComparison;
