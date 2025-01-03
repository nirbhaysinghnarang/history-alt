import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  Background,
  Controls,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './custom.node';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

const nodeTypes = {
  custom: CustomNode,
};

const PivotTree = ({ treeData, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const nodePositions = useRef(new Map());
  const newestNodeId = useRef("")
  const calculateLayout = useMemo(() => {
    return (tree) => {
      const nodes = [];
      const edges = [];
      
      // Track the newest node ID
      
      // First pass: calculate width of each subtree
      const getSubtreeWidth = (node) => {
        if (!node?.children?.length) {
          return 1;
        }
        return node.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0);
      };
  
      // Second pass: position nodes
      const processNode = (node, level = 0, leftOffset = 0, path = []) => {
        if (!node) return;
  
        const VERTICAL_SPACING = 500;
        const NODE_SPACING = 350;
        const id = path.length ? path.join('-') : 'root';   
  
        let position;
  
        if (nodePositions.current.has(id)) {
          position = nodePositions.current.get(id);
        } else {
          const subtreeWidth = Math.max(1, getSubtreeWidth(node));
          const x = leftOffset + (subtreeWidth - 1) * NODE_SPACING / 2;
          position = {
            x: x,
            y: level * VERTICAL_SPACING
          };
          nodePositions.current.set(id, position);
          // Update newest node ID when we find a new node
          newestNodeId.current = id;
        }
        
        
        nodes.push({
          id,
          type: 'custom',
          position,
          data: {
            ...node, 
            isNewNode: id === newestNodeId.current
          },
        });
  
        // Add edge to parent if not root
        if (path.length > 0) {
          const parentId = path.slice(0, -1).join('-') || 'root';
          edges.push({
            id: `${parentId}->${id}`,
            source: parentId,
            target: id,
            type: 'smoothstep',
            animated: false,
            style: { 
              stroke: '#333', 
              strokeWidth: 2
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#333',
            }
          });
        }
  
        // Process children
        let currentOffset = leftOffset;
        node.children?.forEach((child, childIndex) => {
          const childPath = [...path, childIndex];
          const childWidth = getSubtreeWidth(child);
          processNode(child, level + 1, currentOffset, childPath);
          currentOffset += childWidth * NODE_SPACING;
        });
      };
  
      processNode(tree);
      return { nodes, edges };
    };
  }, []);

  const updateGraph = useCallback(
    debounce((newTree) => {
      const { nodes: newNodes, edges: newEdges } = calculateLayout(newTree);
      
      setNodes(prevNodes => {
        if (!isEqual(prevNodes, newNodes)) return newNodes;
        return prevNodes;
      });
      
      setEdges(prevEdges => {
        if (!isEqual(prevEdges, newEdges)) return newEdges;
        return prevEdges;
      });
    }, 100),



    [calculateLayout, setNodes, setEdges]
  );

  useEffect(() => {
    if (treeData) {
      updateGraph(treeData);
    }
  }, [treeData, updateGraph]);

  const handleNodeClick = useCallback((_, node) => {
    onNodeClick?.(node.data);
  }, [onNodeClick]);

  return (
    <div className="fixed inset-0 bg-gray-50">
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.1}
      maxZoom={1.5}
      defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
      fitViewOptions={{ 
        padding: 0.2,
        minZoom: 0.1,
        maxZoom: 1.5
      }}
      className="bg-gray-50"
    >
      <Background 
        color="#666666" 
        variant="dots" 
        size={1} 
        gap={16} 
      />
      <Controls 
        position="bottom-right"
        className="bg-white"
      />
    </ReactFlow>
  </div>
  );
};

export default PivotTree;