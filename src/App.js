import React, { useEffect, useState, useRef, useCallback } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  getOutgoers
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

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [elements, setElements] = useState(initialElements)
  const getNodes = useCallback((node, current) => {
    const nodes = getOutgoers(node, elements)
    nodes.forEach((node) => {
      const newNode = new Node(node.data.label)
      current.next = [...current.next, newNode]
      getNodes(node, newNode)
    })
  }, [elements])
  const getTree = useCallback(() => {
    const newNode = new Node(elements[0].data.label)
    const tree = new List(newNode)
    getNodes(elements[0], newNode)
    console.log(tree.head)
  }, [elements, getNodes])
  useEffect(() => {
    getTree()
    // console.log(getOutgoers(elements[0], elements))
  }, [elements, getTree])
  const onConnect = (params) => {
    setElements((els) => addEdge({ ...params, animated: true }, els))
  }
  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els))

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

  return (
    <div className='dndflow'>
      <ReactFlowProvider>
        <Sidebar />
        <div className='reactflow-wrapper' ref={reactFlowWrapper}>
          <ReactFlow
            elements={elements}
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
