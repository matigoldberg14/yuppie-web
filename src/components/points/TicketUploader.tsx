// src/components/points/TicketUploader.tsx
import React, { useState } from 'react';
import { verifyTicket } from '../../services/userPointsService';
import { useUserAuth } from '../../lib/UserAuthContext';
import { UserAuthForm } from '../auth/UserAuthForm';
import { useToast } from '../ui/use-toast';

interface TicketUploaderProps {
  restaurantId: string;
  restaurantName: string;
}

export function TicketUploader({
  restaurantId,
  restaurantName,
}: TicketUploaderProps) {
  const { user, loading } = useUserAuth?.() || { user: null, loading: false };
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);

  // Si el usuario no está autenticado, mostrar formulario de login
  if (!user && !loading) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card p-6 mb-6">
          <div className="text-center mb-6">
            <span className="text-3xl mb-4 block">🎁</span>
            <h2 className="text-xl font-bold mb-2">
              Gana puntos con tus tickets
            </h2>
            <p className="text-white/80">
              Sube tus tickets para obtener puntos basados en el monto de tu
              compra. ¡Por cada $100 ganas 1 punto adicional!
            </p>
          </div>
          <p className="text-center mb-6 text-white/80">
            Para subir tickets y ganar puntos, primero debes iniciar sesión
          </p>
          <UserAuthForm />
        </div>
      </div>
    );
  }

  // Mientras carga
  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-6 card text-center">
        <div className="animate-pulse">
          <div className="h-10 bg-white/10 rounded mb-4"></div>
          <div className="h-40 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setPointsEarned(null);

    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      setPreview(null);
      return;
    }

    const selectedFile = e.target.files[0];

    // Verificar tamaño (máximo 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage(
        'El archivo es demasiado grande. El tamaño máximo es 5MB.'
      );
      return;
    }

    // Verificar tipo de archivo (solo imágenes)
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('Solo se permiten archivos de imagen (JPG, PNG, etc.)');
      return;
    }

    setFile(selectedFile);

    // Generar vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage('Por favor selecciona un ticket para subir');
      return;
    }

    setProcessing(true);
    setErrorMessage(null);
    setPointsEarned(null);

    try {
      const result = await verifyTicket(file, restaurantId);

      if (result.success) {
        setPointsEarned(result.points || 0);

        toast({
          title: '¡Ticket verificado!',
          description: `Has ganado ${result.points} puntos. ${result.message}`,
          duration: 5000,
        });
      } else {
        setErrorMessage(result.message || 'Error al verificar el ticket');
      }
    } catch (error) {
      console.error('Error al procesar el ticket:', error);
      setErrorMessage(
        'Ha ocurrido un error al procesar el ticket. Por favor intenta nuevamente.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Tarjeta principal */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          Subir Ticket de {restaurantName}
        </h2>

        <p className="text-white/80 mb-6">
          Sube una foto clara de tu ticket de compra para ganar puntos
          adicionales. Asegúrate que se vea claramente la fecha, el monto total
          y el nombre del restaurante.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg">
            {errorMessage}
          </div>
        )}

        {pointsEarned !== null && (
          <div className="mb-6 p-4 bg-green-500/20 text-green-300 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-3xl mr-2">🎉</span>
              <span className="text-2xl font-bold">+{pointsEarned} puntos</span>
            </div>
            <p>¡Ticket verificado correctamente!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Área de arrastrar y soltar */}
          <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center hover:border-white/50 transition-colors">
            <input
              type="file"
              id="ticket-file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={processing || pointsEarned !== null}
            />

            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Vista previa del ticket"
                  className="max-h-60 mx-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setPointsEarned(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70"
                  disabled={processing}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <label
                htmlFor="ticket-file"
                className="flex flex-col items-center justify-center h-40 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white/50 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-white/70">
                  Haz clic para seleccionar o arrastra la imagen aquí
                </span>
                <span className="text-sm text-white/50 mt-2">
                  JPG, PNG (máx. 5MB)
                </span>
              </label>
            )}
          </div>

          {/* Instrucciones */}
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">
              Consejos para una correcta verificación:
            </h3>
            <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
              <li>La imagen debe ser clara y legible</li>
              <li>Asegúrate que se vea el nombre del restaurante</li>
              <li>Se debe ver claramente la fecha y el monto total</li>
              <li>El ticket debe ser de los últimos 7 días</li>
              <li>Un mismo ticket solo puede utilizarse una vez</li>
            </ul>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={!file || processing || pointsEarned !== null}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              !file || processing || pointsEarned !== null
                ? 'bg-white/20 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Procesando...
              </span>
            ) : pointsEarned !== null ? (
              'Ticket verificado'
            ) : (
              'Verificar Ticket'
            )}
          </button>

          {pointsEarned !== null && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setPointsEarned(null);
                }}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Subir otro ticket
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Explicación de conversión de puntos */}
      <div className="card p-6 bg-white/5">
        <h3 className="font-bold mb-3">¿Cómo se calculan los puntos?</h3>
        <div className="space-y-2 text-white/80">
          <p className="flex items-center">
            <span className="inline-block bg-white/10 rounded-full h-6 w-6 flex items-center justify-center mr-2">
              1
            </span>
            Por cada $100 gastos en el restaurante recibes 1 punto
          </p>
          <p className="flex items-center">
            <span className="inline-block bg-white/10 rounded-full h-6 w-6 flex items-center justify-center mr-2">
              2
            </span>
            La fecha del ticket debe coincidir con la fecha de la reseña
          </p>
          <p className="flex items-center">
            <span className="inline-block bg-white/10 rounded-full h-6 w-6 flex items-center justify-center mr-2">
              3
            </span>
            Los puntos tardan hasta 24 horas en reflejarse en tu perfil
          </p>
        </div>
      </div>
    </div>
  );
}
