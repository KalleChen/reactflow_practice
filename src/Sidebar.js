import React from 'react'

const Sidebar = () => {
  const onDragStart = (event, nodes) => {
    event.dataTransfer.setData('node', JSON.stringify(nodes))
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside>
      <div className='description'>You can drag these nodes to the pane on the right.</div>
      <div
        className='dndnode input'
        onDragStart={(event) => onDragStart(event, [{ type: 'default', label: '男' }, { type: 'default', label: '女' }])} draggable
      >
        性別分析
      </div>
      <div
        className='dndnode'
        onDragStart={(event) => onDragStart(event, [{ type: 'default', label: '黃金' }, { type: 'default', label: '消極' }, { type: 'default', label: '新進' }, { type: 'default', label: '沈睡' }])} draggable
      >
        分群分析
      </div>
    </aside>
  )
}

export default Sidebar
