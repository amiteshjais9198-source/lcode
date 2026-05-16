import React from 'react';
import { Plus, Edit, Trash2, Video, Settings, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'text-primary',
      badgeColor: 'bg-primary/20',
      btnColor: 'btn-primary',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and test cases',
      icon: Edit,
      color: 'text-warning',
      badgeColor: 'bg-warning/20',
      btnColor: 'btn-warning',
      route: '/admin/updateList'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform permanently',
      icon: Trash2,
      color: 'text-error',
      badgeColor: 'bg-error/20',
      btnColor: 'btn-error',
      route: '/admin/delete'
    },
     {
      id: 'Video',
      title: 'Video Solutions',
      description: 'Upload and manage video tutorials',
      icon: Video,
      color: 'text-secondary',
      badgeColor: 'bg-secondary/20',
      btnColor: 'btn-secondary',
      route: '/admin/video'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-base-200/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl mix-blend-multiply opacity-50 z-0"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-base-100 rounded-2xl shadow-sm mb-6 border border-base-200">
             <Settings className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold font-mono text-base-content mb-4 tracking-tight">
            Admin <span className="text-primary italic">Dashboard</span>
          </h1>
          <p className="text-base-content/60 text-lg max-w-2xl mx-auto">
            Manage your platform's content. Create challenges, organize test cases, and control the learning material.
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="group relative bg-base-100 rounded-3xl p-8 shadow-xl shadow-base-content/5 border border-base-200 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 block"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl ${option.badgeColor} transition-colors`}>
                    <IconComponent size={28} className={option.color} />
                  </div>
                  <NavLink 
                    to={option.route}
                    className={`btn btn-circle btn-ghost btn-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors`}
                  >
                    <ChevronRight size={20} />
                  </NavLink>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-2 tracking-tight group-hover:text-primary transition-colors">
                    {option.title}
                  </h2>
                  <p className="text-base-content/60 leading-relaxed mb-6">
                    {option.description}
                  </p>
                  
                  <NavLink 
                    to={option.route}
                    className={`btn ${option.btnColor} btn-outline w-full shadow-sm group-hover:shadow-md transition-shadow`}
                  >
                    {option.title}
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin;