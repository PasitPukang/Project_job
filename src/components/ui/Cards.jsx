import React from 'react';

export function CompanyCard({ name, imageUrl }) {
  return (
    <div className="flex flex-col rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 h-full">
      <div className="h-40 w-full overflow-hidden bg-gray-200">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-[#1e3a8a] text-white p-3 min-h-[70px] flex items-center">
        <h3 className="font-medium text-sm leading-tight line-clamp-2">{name}</h3>
      </div>
    </div>
  );
}

export function PremiumCompanyCard({ logoUrl, name }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-6 flex items-center justify-center h-32 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      {/* If no logo is provided, just show the name, else show the image */}
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="font-bold text-xl text-gray-500">{name}</span>
      )}
    </div>
  );
}

export function JobCategoryCard({ title, count, imageUrl }) {
  return (
    <div className="flex flex-col rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 h-full">
      <div className="h-32 w-full overflow-hidden bg-gray-200">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-[#1e3a8a] text-white p-3 flex flex-col justify-center">
        <h3 className="font-medium text-sm mb-1">{title}</h3>
        <p className="text-xs text-blue-200">{count} ตำแหน่งงาน</p>
      </div>
    </div>
  );
}
