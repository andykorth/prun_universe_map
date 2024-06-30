import { useState, useCallback } from 'react';
import fetchGraphData from './useFetchGraphData';

const useGraphState = () => {
  const [graph, setGraph] = useState({ nodes: {}, edges: [] });

  const fetchGraphDataCallback = useCallback(async () => {
    const data = await useFetchGraphData();
    setGraph(data);
  }, []);

  return {
    graph,
    fetchGraphData: fetchGraphDataCallback,
  };
};

export default useGraphState;
