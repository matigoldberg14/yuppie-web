// src/components/common/ErrorDisplay.tsx
export function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="p-6 text-center">
      <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Error loading data</h3>
        <p>{error.message}</p>
      </div>
    </div>
  );
}
