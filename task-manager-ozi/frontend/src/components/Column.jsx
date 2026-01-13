import React from 'react'
import TaskCard from './TaskCard'

export default function Column({ title, tasks }){
  return (
    <div className="w-full md:w-1/3 p-2">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div>
        {tasks.length===0 ? <div className="p-4 text-sm text-gray-500">No tasks</div> : tasks.map(t=> <TaskCard key={t._id} task={t} />)}
      </div>
    </div>
  )
}
