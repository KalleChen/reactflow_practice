import React, { useEffect, useState, useRef, useCallback } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  getOutgoers,
  Handle,
  isNode
} from 'react-flow-renderer'

import Sidebar from './Sidebar'

import './dnd.css'

const initialElements = [
  {
    id: '1',
    type: 'input',
    data: { label: '用戶資料' },
    position: { x: 400, y: 5 },
    draggable: false,
    selectable: false
  }
]

let id = 0
const getId = () => `dndnode_${id++}`

class Node {
  constructor (data) {
    this.label = data
    this.next = []
  }
}

class List {
  constructor (head = null) {
    this.head = head
  }
}

const initialLastNodes = { depth: -1, nodes: [] }

const FinalNode = ({ data }) => {
  return (
    <div style={{ background: 'red' }}>
      <Handle
        type='target'
        position='top'
      />
      <div style={{ padding: '20px' }}>
        <div>
          {data.label}
        </div>
      </div>
      <Handle
        type='source'
        position='bottom'
      />
    </div>
  )
}

const nodeTypes = {
  finalNode: FinalNode
}

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [elements, setElements] = useState(initialElements)
  const [newElements, setNewElements] = useState(initialElements)
  const [lastNodes, setLastNodes] = useState(initialLastNodes)
  const [nodesInTree, setNodesInTree] = useState([])
  const getNode = useCallback((node, current, depth) => {
    setNodesInTree(prev => ([...prev, node]))
    const nodes = getOutgoers(node, elements)
    setLastNodes(prev => {
      if (depth > prev.depth) {
        return { depth: depth, nodes: [node] }
      }
      if (depth === prev.depth) {
        return { ...prev, nodes: [...prev.nodes, node] }
      }
      return prev
    })
    nodes.forEach((node) => {
      const newNode = new Node(node.data.label)
      current.next = [...current.next, newNode]
      getNode(node, newNode, depth + 1)
    })
  }, [elements])
  const getTree = useCallback(async () => {
    setLastNodes(initialLastNodes)
    setNodesInTree([])
    const newNode = new Node(elements[0].data.label)
    const tree = new List(newNode)
    getNode(elements[0], newNode, 0)
    console.log(JSON.parse(JSON.stringify(tree.head)))
  }, [elements, getNode])

  const onConnect = async (params) => {
    setElements((els) => addEdge({ ...params, animated: true }, els))
  }
  const onElementsRemove = (elementsToRemove) => {
    setElements((els) => removeElements(elementsToRemove, els))
  }
  const onLoad = (_reactFlowInstance) => {
    setReactFlowInstance(_reactFlowInstance)
  }

  const onDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const onDrop = (event) => {
    event.preventDefault()

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
    const nodes = JSON.parse(event.dataTransfer.getData('node'))
    nodes.forEach((node, index) => {
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left + (index - parseInt(nodes.length / 2)) * 180,
        y: event.clientY - reactFlowBounds.top
      })
      const newNode = {
        id: getId(),
        type: node.type,
        position,
        data: { label: node.label }
      }
      setElements((es) => es.concat(newNode))
    })
  }

  const onClick = async (event, element) => {
    if (isNode(element)) {
      if (element.id !== '1') {
        if (nodesInTree.find(node => node.id === element.id)) {
          if (lastNodes.nodes.find(node => node.id === element.id)) {
            if (lastNodes.nodes.length === 1) {
              await getTree()
            }
          } else {
            await setLastNodes(prev => ({ depth: -1, nodes: [{ ...element, type: 'finalNode' }] }))
          }
        }
      }
    }
  }

  useEffect(() => {
    getTree()
  }, [elements, getTree])
  useEffect(() => {
    setNewElements(prev => {
      let final = elements
      if (lastNodes.nodes.length === 0 || lastNodes.nodes[0].id === '1') {
        return final
      }
      lastNodes.nodes.forEach(node => {
        final = final.filter(f => f.id !== node.id)
        final = [...final, { ...node, type: 'finalNode' }]
      })
      return final
    })
  }, [elements, setNewElements, lastNodes.nodes])
  return (
    <div className='dndflow'>
      <ReactFlowProvider>
        <Sidebar />
        <div className='reactflow-wrapper' ref={reactFlowWrapper}>
          <ReactFlow
            nodeTypes={nodeTypes}
            onElementClick={onClick}
            elements={newElements}
            onConnect={onConnect}
            onElementsRemove={onElementsRemove}
            onLoad={onLoad}
            onDrop={onDrop}
            onDragOver={onDragOver}
            zoomOnScroll={false}
            defaultZoom={1}
          />
        </div>
      </ReactFlowProvider>
    </div>
  )
}

export default DnDFlow
