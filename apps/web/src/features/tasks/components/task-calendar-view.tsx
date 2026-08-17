'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Task } from '../types/task-types';
import { TaskStatusBadge, TaskPriorityBadge } from './task-badges';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface TaskCalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export function TaskCalendarView({ tasks, onSelectTask }: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon...

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group tasks by day number (1..31) in current month
  const tasksByDay: Record<number, Task[]> = {};
  tasks.forEach((t) => {
    if (t.dueDate) {
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        if (!tasksByDay[dayNum]) tasksByDay[dayNum] = [];
        tasksByDay[dayNum].push(t);
      }
    }
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl shadow-2xs">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">{monthName}</h3>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
        {/* Days of Week Row */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-center text-xs font-semibold text-muted-foreground py-2.5">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border min-h-[500px]">
          {/* Empty prefix cells */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-muted/20 p-2 min-h-[100px]" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayTasks = tasksByDay[dayNum] || [];
            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={`day-${dayNum}`}
                className={`p-2 min-h-[100px] flex flex-col space-y-1.5 transition-colors ${
                  isToday ? 'bg-primary/5' : 'hover:bg-muted/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-bold font-mono h-6 w-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[9px] font-bold text-muted-foreground">
                      {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Tasks List inside Day Cell */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-none">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="p-1.5 rounded border border-border bg-card hover:border-primary/50 text-[10px] space-y-0.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <p className="font-semibold text-foreground line-clamp-1">{task.title}</p>
                      <div className="flex items-center justify-between">
                        <TaskPriorityBadge priority={task.priority} className="text-[8px] py-0 px-1" />
                        <TaskStatusBadge status={task.status} className="text-[8px] py-0 px-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
