import { Category } from './types';
import { 
  Moon, 
  Utensils, 
  BookOpen, 
  Briefcase, 
  Gamepad2, 
  Users, 
  MoreHorizontal,
  Edit3
} from 'lucide-react';
import React from 'react';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'sleep', name: 'Sleep', color: '#6366f1', icon: 'Moon' },         // Indigo
  { id: 'diet', name: 'Diet/Food', color: '#22c55e', icon: 'Utensils' },   // Green
  { id: 'study', name: 'Study', color: '#eab308', icon: 'BookOpen' },      // Yellow
  { id: 'work', name: 'Work', color: '#ef4444', icon: 'Briefcase' },       // Red
  { id: 'entertainment', name: 'Fun', color: '#ec4899', icon: 'Gamepad2' },// Pink
  { id: 'social', name: 'Social', color: '#f97316', icon: 'Users' },       // Orange
  { id: 'misc', name: 'Misc/Idle', color: '#64748b', icon: 'MoreHorizontal' }, // Slate
  { id: 'custom', name: 'Custom', color: '#737373', icon: 'Edit3' },       // Neutral
];

export const getIconComponent = (iconName?: string) => {
  switch (iconName) {
    case 'Moon': return <Moon size={18} />;
    case 'Utensils': return <Utensils size={18} />;
    case 'BookOpen': return <BookOpen size={18} />;
    case 'Briefcase': return <Briefcase size={18} />;
    case 'Gamepad2': return <Gamepad2 size={18} />;
    case 'Users': return <Users size={18} />;
    case 'MoreHorizontal': return <MoreHorizontal size={18} />;
    case 'Edit3': return <Edit3 size={18} />;
    default: return <MoreHorizontal size={18} />;
  }
};