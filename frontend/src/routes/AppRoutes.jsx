import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';
import Teams from '../pages/Teams/Teams';
import Projects from '../pages/Projects/Projects';
import TaskList from '../pages/Tasks/TaskList';
import KanbanBoard from '../pages/Tasks/KanbanBoard';
import ScrumUpdates from '../pages/Scrum/ScrumUpdates';
import BlockerTracking from '../pages/Blockers/BlockerTracking';
import Members from '../pages/Members/Members';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/members" element={<Members />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/tasks" element={<TaskList />} />
      <Route path="/kanban" element={<KanbanBoard />} />
      <Route path="/scrum" element={<ScrumUpdates />} />
      <Route path="/blockers" element={<BlockerTracking />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
