// /Users/Mati/Desktop/yuppie-web/src/components/dashboard/EmployeeSchedule.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Plus, Trash, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';

// Interfaces
export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  [day: string]: TimeBlock[];
}

export interface ScheduleComponentProps {
  schedule: DaySchedule;
  onChange: (schedule: DaySchedule) => void;
}

// Datos de días de la semana
const DAYS = [
  { id: 'monday', label: 'Lunes' },
  { id: 'tuesday', label: 'Martes' },
  { id: 'wednesday', label: 'Miércoles' },
  { id: 'thursday', label: 'Jueves' },
  { id: 'friday', label: 'Viernes' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

// Función para generar IDs únicos
const generateId = () => Math.random().toString(36).substring(2, 11);

// Componente principal para gestión de horarios - DISEÑO VERTICAL MEJORADO
export function EmployeeSchedule({
  schedule,
  onChange,
}: ScheduleComponentProps) {
  const [copySource, setCopySource] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const { toast } = useToast();

  // Inicializar el horario si no existe
  useEffect(() => {
    const initSchedule: DaySchedule = {};

    // Si schedule está vacío, inicializamos con días vacíos
    if (Object.keys(schedule).length === 0) {
      DAYS.forEach((day) => {
        initSchedule[day.id] = [];
      });
      onChange(initSchedule);
    }
    // Si falta algún día, lo añadimos
    else {
      let updated = false;
      const newSchedule = { ...schedule };

      DAYS.forEach((day) => {
        if (!newSchedule[day.id]) {
          newSchedule[day.id] = [];
          updated = true;
        }
      });

      if (updated) {
        onChange(newSchedule);
      }
    }
  }, []);

  // Añadir un nuevo bloque de tiempo a un día
  const addTimeBlock = (day: string) => {
    const newSchedule = { ...schedule };

    // Añadir bloque con horario por defecto inteligente
    const defaultStart = '09:00';
    const defaultEnd = '17:00';

    // Si ya hay bloques, usar el último como referencia
    if (newSchedule[day].length > 0) {
      const lastBlock = newSchedule[day][newSchedule[day].length - 1];
      // Sugerir un horario que empiece después del último bloque
      const lastEndHour = parseInt(lastBlock.endTime.split(':')[0]);
      const lastEndMinute = parseInt(lastBlock.endTime.split(':')[1]);

      let newStartHour = lastEndHour;
      let newStartMinute = lastEndMinute + 30;

      if (newStartMinute >= 60) {
        newStartHour += 1;
        newStartMinute -= 60;
      }

      if (newStartHour > 22) newStartHour = 22;

      const newEndHour = Math.min(newStartHour + 2, 23);

      const newStartTime = `${String(newStartHour).padStart(2, '0')}:${String(
        newStartMinute
      ).padStart(2, '0')}`;
      const newEndTime = `${String(newEndHour).padStart(2, '0')}:${String(
        newStartMinute
      ).padStart(2, '0')}`;

      newSchedule[day].push({
        id: generateId(),
        startTime: newStartTime,
        endTime: newEndTime,
      });
    } else {
      newSchedule[day].push({
        id: generateId(),
        startTime: defaultStart,
        endTime: defaultEnd,
      });
    }

    onChange(newSchedule);

    // Expandir automáticamente el día cuando se agrega un horario
    setExpandedDay(day);
  };

  // Remover un bloque de tiempo
  const removeTimeBlock = (day: string, blockId: string) => {
    const newSchedule = { ...schedule };
    newSchedule[day] = newSchedule[day].filter((block) => block.id !== blockId);
    onChange(newSchedule);
  };

  // Actualizar un bloque de tiempo
  const updateTimeBlock = (
    day: string,
    blockId: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const newSchedule = { ...schedule };
    const blockIndex = newSchedule[day].findIndex(
      (block) => block.id === blockId
    );

    if (blockIndex !== -1) {
      newSchedule[day][blockIndex] = {
        ...newSchedule[day][blockIndex],
        [field]: value,
      };
      onChange(newSchedule);
    }
  };

  // Copiar bloques de tiempo de un día a otro
  const copyDay = (sourceDay: string) => {
    setCopySource(sourceDay);
    toast({
      title: 'Día copiado',
      description: `Selecciona otro día para copiar el horario de ${getDayLabel(
        sourceDay
      )}`,
    });
  };

  // Pegar bloques de tiempo en un día
  const pasteDay = (targetDay: string) => {
    if (!copySource || copySource === targetDay) {
      setCopySource(null);
      return;
    }

    const newSchedule = { ...schedule };
    // Hacer copias profundas de los bloques para que tengan IDs distintos
    newSchedule[targetDay] = schedule[copySource].map((block) => ({
      ...block,
      id: generateId(), // Generar nuevos IDs
    }));

    onChange(newSchedule);
    toast({
      title: 'Horario pegado',
      description: `Se copió el horario de ${getDayLabel(
        copySource
      )} a ${getDayLabel(targetDay)}`,
    });

    setCopySource(null);
    // Expandir automáticamente el día de destino
    setExpandedDay(targetDay);
  };

  // Obtener etiqueta del día a partir del ID
  const getDayLabel = (dayId: string): string => {
    const day = DAYS.find((d) => d.id === dayId);
    return day ? day.label : dayId;
  };

  // Verificar si hay error en un bloque de tiempo
  const getTimeBlockError = (day: string, blockId: string): string | null => {
    const block = schedule[day]?.find((b) => b.id === blockId);
    if (!block) return null;

    // Verificar que la hora de fin sea posterior a la de inicio
    if (block.startTime >= block.endTime) {
      return 'La hora de fin debe ser posterior a la de inicio';
    }

    // Verificar superposición con otros bloques
    const otherBlocks = schedule[day]?.filter((b) => b.id !== blockId) || [];
    for (const otherBlock of otherBlocks) {
      // Verificar si el bloque actual se superpone con otherBlock
      if (
        (block.startTime < otherBlock.endTime &&
          block.endTime > otherBlock.startTime) ||
        (otherBlock.startTime < block.endTime &&
          otherBlock.endTime > block.startTime)
      ) {
        return 'Este horario se superpone con otro del mismo día';
      }
    }

    return null;
  };

  // Contar total de bloques de horario en todos los días
  const getTotalScheduleBlocks = (): number => {
    return Object.values(schedule).reduce(
      (total, dayBlocks) => total + dayBlocks.length,
      0
    );
  };

  // Mostrar el resumen de horarios
  const getScheduleSummary = (): string => {
    const daysWithSchedule = DAYS.filter((day) => schedule[day.id]?.length > 0);
    if (daysWithSchedule.length === 0) return 'Sin horarios configurados';

    if (daysWithSchedule.length === 7)
      return 'Horario configurado para todos los días';

    return `Horario configurado para ${daysWithSchedule.length} días`;
  };

  return (
    <div className="space-y-2">
      {/* Resumen de horarios */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="text-sm text-white/70">{getScheduleSummary()}</div>
        {copySource && (
          <div className="text-sm text-blue-400 flex items-center gap-1">
            <span>Copiando {getDayLabel(copySource)}</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setCopySource(null)}
              className="h-6 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Lista vertical de días de la semana */}
      <div className="space-y-2">
        {DAYS.map((day) => {
          const hasSchedule = schedule[day.id]?.length > 0;
          const isExpanded = expandedDay === day.id;

          return (
            <div
              key={day.id}
              className={`rounded-lg transition-colors ${
                copySource === day.id
                  ? 'bg-blue-500/30 border border-blue-500'
                  : copySource
                  ? 'bg-white/5 border border-white/20 hover:border-blue-500/50 cursor-pointer'
                  : hasSchedule
                  ? 'bg-white/10 border border-white/10'
                  : 'bg-white/5 border border-white/10'
              }`}
              onClick={() =>
                copySource && copySource !== day.id ? pasteDay(day.id) : null
              }
            >
              <div
                className={`flex justify-between items-center p-3 cursor-pointer ${
                  hasSchedule ? 'hover:bg-white/10' : ''
                } rounded-t-lg`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasSchedule) {
                    setExpandedDay(isExpanded ? null : day.id);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-medium ${
                      hasSchedule ? 'text-white' : 'text-white/70'
                    }`}
                  >
                    {day.label}
                  </h3>
                  {hasSchedule && (
                    <div className="text-sm text-white/60">
                      {schedule[day.id].length}{' '}
                      {schedule[day.id].length === 1 ? 'horario' : 'horarios'}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Botones de acciones */}
                  {copySource === day.id ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCopySource(null);
                      }}
                      className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyDay(day.id);
                      }}
                      className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                      disabled={!hasSchedule}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      addTimeBlock(day.id);
                    }}
                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>

                  {hasSchedule && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDay(isExpanded ? null : day.id);
                      }}
                      className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Contenido del día (bloques de horario) */}
              <AnimatePresence>
                {hasSchedule && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 space-y-2 border-t border-white/10">
                      {schedule[day.id].map((block) => {
                        const error = getTimeBlockError(day.id, block.id);

                        return (
                          <motion.div
                            key={block.id}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`flex items-center gap-3 p-3 rounded ${
                              error
                                ? 'bg-red-500/20 border border-red-500/40'
                                : 'bg-white/10'
                            }`}
                          >
                            <div className="flex-grow grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-white/60 mb-1">
                                  Hora inicio
                                </div>
                                <input
                                  type="time"
                                  value={block.startTime}
                                  onChange={(e) =>
                                    updateTimeBlock(
                                      day.id,
                                      block.id,
                                      'startTime',
                                      e.target.value
                                    )
                                  }
                                  className="bg-white/10 border border-white/20 rounded p-2 text-sm text-white w-full"
                                />
                              </div>
                              <div>
                                <div className="text-xs text-white/60 mb-1">
                                  Hora fin
                                </div>
                                <input
                                  type="time"
                                  value={block.endTime}
                                  onChange={(e) =>
                                    updateTimeBlock(
                                      day.id,
                                      block.id,
                                      'endTime',
                                      e.target.value
                                    )
                                  }
                                  className="bg-white/10 border border-white/20 rounded p-2 text-sm text-white w-full"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeTimeBlock(day.id, block.id)}
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        );
                      })}

                      {/* Botón para añadir otro horario */}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => addTimeBlock(day.id)}
                        className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 border border-dashed border-blue-400/30"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir otro horario
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mostrar botón para añadir horario si no hay ninguno */}
              {!hasSchedule && (
                <div className="p-3 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      addTimeBlock(day.id);
                    }}
                    className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir horario
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EmployeeSchedule;
