import { ResponsiveContainer } from 'recharts';

interface Props {
  className?: string;
  title: string;
  graph: React.ReactElement;
  graphHeight?: string;
}

export default function GraphCard({
  className,
  title,
  graph,
  graphHeight = '300px',
}: Props) {
  return (
    <div
      className={`${className} bg-white/10 border-0 hover:bg-white/20 transition-colors flex flex-col p-4 gap-4 rounded-lg`}
    >
      <h3>{title}</h3>
      <div style={{ height: graphHeight }}>
        <ResponsiveContainer width='100%' height='100%'>
          {graph}
        </ResponsiveContainer>
      </div>
    </div>
  );
  return <div>GraphCard</div>;
}
